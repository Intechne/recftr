import { createClient } from "@supabase/supabase-js";

export const PUBLIC_BUCKET = "recf-public";
export const PRIVATE_BUCKET = "team-private";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for Storage.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function safeFileName(name: string) {
  const ext = name.includes(".") ? "." + name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = name.replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[ç]/g,"c").replace(/[ğ]/g,"g").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ş]/g,"s").replace(/[ü]/g,"u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
}

export async function createUpload(bucket: string, path: string, upsert = false) {
  const { data, error } = await client().storage.from(bucket).createSignedUploadUrl(path, { upsert });
  if (error) throw error;
  return data;
}
export async function createPrivateDownload(path: string, expiresIn = 900) {
  const { data, error } = await client().storage.from(PRIVATE_BUCKET).createSignedUrl(path, expiresIn, { download: true });
  if (error) throw error;
  return data.signedUrl;
}
export function publicUrl(path: string) {
  return client().storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl;
}
export async function removeObject(bucket: string, path: string) {
  const { error } = await client().storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function pathFromPublicUrl(url?: string | null) {
  if (!url) return "";
  const marker = `/storage/v1/object/public/${PUBLIC_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return "";
  try { return decodeURIComponent(url.slice(i + marker.length).split("?")[0]); } catch { return ""; }
}
