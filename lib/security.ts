import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { audit, consumeRateLimit } from "@/lib/db";

export function clientIp(req: NextRequest) {
  // Vercel overwrites this header at its edge. Other deployments must explicitly
  // configure a proxy that strips client-supplied copies of their chosen header.
  const header = process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : process.env.TRUSTED_CLIENT_IP_HEADER;
  const value = header && /^[a-z0-9-]+$/i.test(header) ? req.headers.get(header)?.split(",")[0]?.trim() : "";
  return value && /^(?:[a-f0-9:.]+)$/i.test(value) ? value.slice(0, 80) : "unknown";
}

export function securityHash(value: string) {
  const salt = process.env.RATE_LIMIT_SALT || process.env.SESSION_SECRET || "recf-rate-limit";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export async function enforceRateLimit(req: NextRequest, scope: string, identifier: string, limit: number, windowSeconds: number) {
  const key = securityHash(`${scope}:${identifier}`);
  const result = await consumeRateLimit(key, limit, windowSeconds);
  return result;
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Çok fazla istek gönderildi. Lütfen kısa bir süre sonra tekrar deneyin." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, retryAfter)), "Cache-Control": "no-store" } },
  );
}

export function cleanText(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validHttpUrl(value: string, allowRelative = false) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (allowRelative && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")) return true;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || (process.env.NODE_ENV !== "production" && u.protocol === "http:");
  } catch { return false; }
}


export function bootstrapSessionVersion(password: string) {
  const hex = createHash("sha256").update(String(password || "")).digest("hex").slice(0, 8);
  return parseInt(hex, 16) || 1;
}

export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export async function securityAudit(actor: string, action: string, details: Record<string, unknown> = {}) {
  await audit(actor || "anonymous", action, "security", "auth", details);
}
