import { createClient } from "@supabase/supabase-js";

export const PUBLIC_BUCKET = "recf-public";
export const PRIVATE_BUCKET = "team-private";

export const IMAGE_MIME = ["image/jpeg","image/png","image/webp","image/gif","image/avif","image/x-icon","image/vnd.microsoft.icon"];
export const VIDEO_MIME = ["video/mp4","video/webm","video/quicktime"];
export const DOC_MIME = [
  "application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/plain",
  "image/jpeg","image/png","image/webp",
];
export const PUBLIC_MIME = Array.from(new Set([...IMAGE_MIME, ...VIDEO_MIME, ...DOC_MIME]));

function storageConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const missing = [!url && "SUPABASE_URL", !key && "SUPABASE_SECRET_KEY"].filter(Boolean).join(" + ");
    throw new Error(`${missing} eksik. Vercel > Settings > Environment Variables bölümünü kontrol edin.`);
  }
  return { url: url.replace(/\/$/, ""), key };
}

function client() {
  const { url, key } = storageConfig();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

let bucketsReady: Promise<void> | null = null;
export async function ensureStorageBuckets() {
  if (bucketsReady) return bucketsReady;
  bucketsReady = (async () => {
    const c = client();
    const defs = [
      { id: PUBLIC_BUCKET, public: true, fileSizeLimit: 50 * 1024 * 1024, allowedMimeTypes: PUBLIC_MIME },
      { id: PRIVATE_BUCKET, public: false, fileSizeLimit: 20 * 1024 * 1024, allowedMimeTypes: DOC_MIME },
    ];
    for (const b of defs) {
      const { data, error } = await c.storage.getBucket(b.id);
      if (error && !/not found/i.test(error.message || "")) throw error;
      if (!data) {
        const created = await c.storage.createBucket(b.id, { public: b.public, fileSizeLimit: b.fileSizeLimit, allowedMimeTypes: b.allowedMimeTypes });
        if (created.error && !/already exists/i.test(created.error.message || "")) throw created.error;
      } else {
        const updated = await c.storage.updateBucket(b.id, { public: b.public, fileSizeLimit: b.fileSizeLimit, allowedMimeTypes: b.allowedMimeTypes });
        if (updated.error) throw updated.error;
      }
    }
  })().catch((e) => { bucketsReady = null; throw e; });
  return bucketsReady;
}

export function safeFileName(name: string) {
  const ext = name.includes(".") ? "." + name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = name.replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[ç]/g,"c").replace(/[ğ]/g,"g").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ş]/g,"s").replace(/[ü]/g,"u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
  return `${base}-${Date.now()}-${crypto.randomUUID().slice(0,8)}${ext}`;
}

const EXTENSIONS: Record<string, string[]> = {
  "image/jpeg":["jpg","jpeg"], "image/png":["png"], "image/webp":["webp"], "image/gif":["gif"], "image/avif":["avif"],
  "image/x-icon":["ico"], "image/vnd.microsoft.icon":["ico"], "video/mp4":["mp4"], "video/webm":["webm"], "video/quicktime":["mov"],
  "application/pdf":["pdf"], "application/msword":["doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document":["docx"],
  "application/vnd.ms-excel":["xls"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":["xlsx"], "text/plain":["txt"],
};

export function extensionMatchesMime(fileName: string, mime: string) {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  return !!ext && !!EXTENSIONS[mime]?.includes(ext);
}

export function safeStoragePath(path: string, prefix: string) {
  const p = String(path || "");
  const pre = prefix.replace(/\/$/, "") + "/";
  return p.startsWith(pre) && !p.includes("..") && !p.includes("\\") && !p.includes("//") && p.length <= 500;
}

export async function createUpload(bucket: string, path: string, upsert = false) {
  await ensureStorageBuckets();
  const { data, error } = await client().storage.from(bucket).createSignedUploadUrl(path, { upsert });
  if (error) throw new Error(`Supabase Storage imzalı yükleme URL'si oluşturulamadı: ${error.message}`);
  return data;
}

export async function createPrivateDownload(path: string, expiresIn = 300) {
  await ensureStorageBuckets();
  if (!safeStoragePath(path, "teams")) throw new Error("Geçersiz özel dosya yolu.");
  const { data, error } = await client().storage.from(PRIVATE_BUCKET).createSignedUrl(path, Math.min(Math.max(expiresIn, 60), 900), { download: true });
  if (error) throw new Error(`Özel dosya bağlantısı oluşturulamadı: ${error.message}`);
  return data.signedUrl;
}

export function publicUrl(path: string) { return client().storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl; }

export function publicUrlMatchesPath(url: string, path: string) {
  try { return pathFromPublicUrl(url) === path; } catch { return false; }
}

export async function verifyPublicImageReference(url: string) {
  const path = pathFromPublicUrl(url);
  if (!path) return null; // External HTTPS images are controlled separately by URL validation.
  if (!safeStoragePath(path, "media")) return "Görsel Storage yolu geçersiz.";
  const result = await verifyStoredObject(PUBLIC_BUCKET, path, IMAGE_MIME, 25 * 1024 * 1024);
  return result.ok ? null : result.error;
}

export function matchesFileSignature(mime: string, bytes: Uint8Array) {
  const hex = (length: number) => Array.from(bytes.slice(0, length), byte => byte.toString(16).padStart(2, "0")).join("");
  const ascii = (start: number, length: number) => new TextDecoder().decode(bytes.slice(start, start + length));
  if (mime === "image/jpeg") return hex(3) === "ffd8ff";
  if (mime === "image/png") return hex(8) === "89504e470d0a1a0a";
  if (mime === "image/webp") return ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  if (mime === "image/gif") return ["GIF87a", "GIF89a"].includes(ascii(0, 6));
  if (mime === "image/avif") return ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4));
  if (["image/x-icon", "image/vnd.microsoft.icon"].includes(mime)) return hex(4) === "00000100";
  if (mime === "video/webm") return hex(4) === "1a45dfa3";
  if (mime === "video/mp4") return ascii(4, 4) === "ftyp" && ascii(8, 4) !== "qt  ";
  if (mime === "video/quicktime") return ascii(4, 4) === "ftyp" && ascii(8, 4) === "qt  ";
  if (mime === "application/pdf") return ascii(0, 5) === "%PDF-";
  if (["application/msword", "application/vnd.ms-excel"].includes(mime)) return hex(8) === "d0cf11e0a1b11ae1";
  if (["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(mime)) return hex(4) === "504b0304";
  if (mime === "text/plain") {
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes, { stream: true }); return !bytes.some(byte => byte === 0); }
    catch { return false; }
  }
  return false;
}

async function readObjectPrefix(bucket: string, path: string) {
  const { data, error } = await client().storage.from(bucket).createSignedUrl(path, 60);
  if (error || !data?.signedUrl) throw new Error("Dosya bağlantısı oluşturulamadı.");
  const response = await fetch(data.signedUrl, {
    headers: { Range: "bytes=0-4095" },
    cache: "no-store",
  });
  if (!response.ok || !response.body) throw new Error("Dosya içeriği okunamadı.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (length < 4096) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      length += value.length;
    }
  } finally { await reader.cancel().catch(() => {}); }
  const prefix = new Uint8Array(Math.min(length, 4096));
  let offset = 0;
  for (const chunk of chunks) { const part = chunk.slice(0, prefix.length - offset); prefix.set(part, offset); offset += part.length; }
  return prefix;
}

export async function verifyStoredObject(bucket: string, path: string, allowedMimeTypes: string[], maxBytes: number): Promise<{ ok: true; size: number; mime: string } | { ok: false; error: string }> {
  if (!path || path.includes("..") || path.includes("\\")) return { ok:false, error:"Geçersiz dosya yolu." };
  const slash = path.lastIndexOf("/");
  const folder = slash >= 0 ? path.slice(0, slash) : "";
  const name = slash >= 0 ? path.slice(slash + 1) : path;
  const { data, error } = await client().storage.from(bucket).list(folder, { search: name, limit: 10 });
  if (error) return { ok:false, error:"Yüklenen dosya doğrulanamadı." };
  const item:any = (data || []).find((x:any) => x.name === name);
  if (!item) return { ok:false, error:"Yüklenen dosya Storage üzerinde bulunamadı." };
  const size = Number(item.metadata?.size || 0);
  const mime = String(item.metadata?.mimetype || item.metadata?.contentType || "").toLowerCase();
  if (!size || size > maxBytes) return { ok:false, error:"Yüklenen dosya boyutu geçersiz." };
  if (!mime || !allowedMimeTypes.includes(mime)) return { ok:false, error:"Yüklenen dosyanın MIME türü izinli değil." };
  try {
    if (!matchesFileSignature(mime, await readObjectPrefix(bucket, path))) return { ok:false, error:"Dosya içeriği MIME türüyle eşleşmiyor." };
  } catch { return { ok:false, error:"Dosya içeriği doğrulanamadı." }; }
  return { ok:true, size, mime };
}

export async function removeObject(bucket: string, path: string) {
  if (!path) return;
  await ensureStorageBuckets();
  const { error } = await client().storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage dosyası silinemedi: ${error.message}`);
}

export function pathFromPublicUrl(url?: string | null) {
  if (!url) return "";
  const marker = `/storage/v1/object/public/${PUBLIC_BUCKET}/`;
  try {
    const target = new URL(url);
    const { url: configured } = storageConfig();
    const expected = new URL(configured);
    if (target.origin !== expected.origin || !target.pathname.startsWith(marker)) return "";
    const path = decodeURIComponent(target.pathname.slice(marker.length));
    return path && !path.includes("..") && !path.includes("\\") ? path : "";
  } catch { return ""; }
}

export async function storageDiagnostics() {
  const env = { supabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL), secretKey: !!(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) };
  if (!env.supabaseUrl || !env.secretKey) return { ok: false, env, buckets: [], error: "Supabase Storage environment variables eksik." };
  try {
    await ensureStorageBuckets();
    const c = client();
    const { data, error } = await c.storage.listBuckets();
    if (error) throw error;
    const buckets = (data || []).filter((b:any) => [PUBLIC_BUCKET, PRIVATE_BUCKET].includes(b.id)).map((b:any) => ({ id:b.id, public:b.public, fileSizeLimit:b.file_size_limit, allowedMimeTypes:b.allowed_mime_types || [] }));
    return { ok: buckets.length === 2, env, buckets, error: buckets.length === 2 ? null : "Storage bucket yapılandırması eksik." };
  } catch (e:any) { return { ok:false, env, buckets:[], error:e?.message || "Storage kontrolü başarısız." }; }
}
