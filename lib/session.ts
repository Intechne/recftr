export type SessionRole = "admin" | "editor" | "approvals" | "technical" | "mentor";
export type SessionPayload = {
  role: SessionRole;
  email: string;
  name?: string;
  teamNum?: string | null;
  sv: number;
  mustChangePassword?: boolean;
  iat: number;
  exp: number;
};

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-recf_session" : "recf_session";

const encoder = new TextEncoder();
const CMS_HOURS = 4;
const PORTAL_HOURS = 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV !== "production") return value || "recf-local-dev-session-secret-change-me-32-chars";
  throw new Error("SESSION_SECRET must be at least 32 characters in production.");
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

export async function createSessionToken(input: Omit<SessionPayload, "iat" | "exp">) {
  const iat = Math.floor(Date.now() / 1000);
  const ttl = 60 * 60 * (input.role === "mentor" ? PORTAL_HOURS : CMS_HOURS);
  const payload: SessionPayload = { ...input, iat, exp: iat + ttl };
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
    const now = Math.floor(Date.now() / 1000);
    if (!payload.email || !payload.role || !payload.exp || !payload.iat || payload.exp <= now || payload.iat > now + 60) return null;
    if (!Number.isInteger(payload.sv) || payload.sv < 0) return null;
    if (!["admin","editor","approvals","technical","mentor"].includes(payload.role)) return null;
    return payload;
  } catch { return null; }
}
