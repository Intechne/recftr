export type SessionRole = "admin" | "editor" | "approvals" | "technical" | "mentor";
export type SessionPayload = {
  role: SessionRole;
  email: string;
  name?: string;
  teamNum?: string | null;
  exp: number;
};

const encoder = new TextEncoder();
const EIGHT_HOURS = 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "recf-local-dev-session-secret-change-me";
  throw new Error("SESSION_SECRET is required in production.");
}

function b64url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function key() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(input: Omit<SessionPayload, "exp">) {
  const payload: SessionPayload = { ...input, exp: Math.floor(Date.now() / 1000) + EIGHT_HOURS };
  const encoded = b64url(encoder.encode(JSON.stringify(payload)));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), encoder.encode(encoded)));
  return `${encoded}.${b64url(signature)}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encoded, signatureText, ...rest] = token.split(".");
  if (!encoded || !signatureText || rest.length) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(signatureText), encoder.encode(encoded));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(encoded))) as SessionPayload;
    if (!payload.email || !payload.role || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!["admin","editor","approvals","technical","mentor"].includes(payload.role)) return null;
    return payload;
  } catch { return null; }
}
