export type SessionRole = "admin" | "mentor";

const encoder = new TextEncoder();
const EIGHT_HOURS = 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "recf-local-dev-session-secret-change-me";
  throw new Error("SESSION_SECRET is required in production.");
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function key() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(role: SessionRole) {
  const exp = Math.floor(Date.now() / 1000) + EIGHT_HOURS;
  const payload = `${role}.${exp}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload))
  );
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionRole | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, expText, signatureText] = parts;
  if (role !== "admin" && role !== "mentor") return null;
  const exp = Number(expText);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  try {
    const payload = `${role}.${expText}`;
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromBase64Url(signatureText),
      encoder.encode(payload)
    );
    return ok ? role : null;
  } catch {
    return null;
  }
}
