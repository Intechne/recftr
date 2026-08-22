import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { audit, consumeRateLimit } from "@/lib/db";

export function clientIp(req: NextRequest) {
  // Vercel sets x-vercel-forwarded-for / x-forwarded-for at the edge. Prefer the
  // platform header so a user-supplied x-real-ip value cannot become the primary key.
  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = req.headers.get("x-real-ip")?.trim();
  return (vercel || forwarded || real || "unknown").slice(0, 80);
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
