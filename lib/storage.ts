import { createClient } from "@supabase/supabase-js";

export const PUBLIC_BUCKET = "recf-public";
export const PRIVATE_BUCKET = "team-private";

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
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

let bucketsReady: Promise<void> | null = null;
export async function ensureStorageBuckets() {
  if (bucketsReady) return bucketsReady;
  bucketsReady = (async () => {
    const c = client();
    const defs = [
      { id: PUBLIC_BUCKET, public: true, fileSizeLimit: 50 * 1024 * 1024 },
      { id: PRIVATE_BUCKET, public: false, fileSizeLimit: 50 * 1024 * 1024 },
    ];
    for (const b of defs) {
      const { data, error } = await c.storage.getBucket(b.id);
      if (error && !/not found/i.test(error.message || "")) throw error;
      if (!data) {
        const created = await c.storage.createBucket(b.id, {
          public: b.public,
          fileSizeLimit: b.fileSizeLimit,
        });
        if (created.error && !/already exists/i.test(created.error.message || "")) throw created.error;
      } else if (data.public !== b.public) {
        const updated = await c.storage.updateBucket(b.id, {
          public: b.public,
          fileSizeLimit: b.fileSizeLimit,
        });
        if (updated.error) throw updated.error;
      }
    }
  })().catch((e) => {
    bucketsReady = null;
    throw e;
  });
  return bucketsReady;
}

export function safeFileName(name: string) {
  const ext = name.includes(".") ? "." + name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = name.replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[ç]/g,"c").replace(/[ğ]/g,"g").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ş]/g,"s").replace(/[ü]/g,"u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

export async function createUpload(bucket: string, path: string, upsert = false) {
  await ensureStorageBuckets();
  const { data, error } = await client().storage.from(bucket).createSignedUploadUrl(path, { upsert });
  if (error) throw new Error(`Supabase Storage imzalı yükleme URL'si oluşturulamadı: ${error.message}`);
  return data;
}

export async function createPrivateDownload(path: string, expiresIn = 900) {
  await ensureStorageBuckets();
  const { data, error } = await client().storage.from(PRIVATE_BUCKET).createSignedUrl(path, expiresIn, { download: true });
  if (error) throw new Error(`Özel dosya bağlantısı oluşturulamadı: ${error.message}`);
  return data.signedUrl;
}

export function publicUrl(path: string) {
  return client().storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl;
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
  const i = url.indexOf(marker);
  if (i < 0) return "";
  try { return decodeURIComponent(url.slice(i + marker.length).split("?")[0]); } catch { return ""; }
}

export async function storageDiagnostics() {
  const env = {
    supabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    secretKey: !!(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  if (!env.supabaseUrl || !env.secretKey) return { ok: false, env, buckets: [], error: "Supabase Storage environment variables eksik." };
  try {
    await ensureStorageBuckets();
    const c = client();
    const { data, error } = await c.storage.listBuckets();
    if (error) throw error;
    const buckets = (data || []).filter((b:any) => [PUBLIC_BUCKET, PRIVATE_BUCKET].includes(b.id)).map((b:any) => ({ id:b.id, public:b.public }));
    return { ok: buckets.length === 2, env, buckets, error: buckets.length === 2 ? null : "Storage bucketları eksik." };
  } catch (e:any) {
    return { ok:false, env, buckets:[], error:e?.message || "Storage bağlantısı kurulamadı." };
  }
}
