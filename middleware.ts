import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const CMS = ["admin", "editor", "approvals", "technical"];
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function sameOriginMutation(req: NextRequest) {
  const fetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return fetchSite === "same-origin";
  try {
    const host = req.headers.get("host");
    if (!host || !/^[a-z0-9.:-]+$/i.test(host)) return false;
    return new URL(origin).origin === `${req.nextUrl.protocol}//${host}`;
  } catch { return false; }
}

function contentSecurityPolicy(nonce: string) {
  let supabaseOrigin = "https://example.invalid";
  try { supabaseOrigin = new URL(process.env.SUPABASE_URL || "https://example.invalid").origin; } catch {}
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    `connect-src 'self' ${supabaseOrigin}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const policy = contentSecurityPolicy(nonce);
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const finish = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", policy);
    return response;
  };
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api/")) {
    if (MUTATING.has(req.method)) {
      const length = Number(req.headers.get("content-length") || 0);
      if (length > 512 * 1024) return finish(NextResponse.json({ error: "İstek gövdesi çok büyük." }, { status: 413 }));
      if (!sameOriginMutation(req)) return finish(NextResponse.json({ error: "Cross-site işlem reddedildi." }, { status: 403 }));
    }
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    return finish(response);
  }

  const admin = path.startsWith("/admin");
  const portal = path.startsWith("/portal");
  if (!admin && !portal) return finish(NextResponse.next({ request: { headers } }));
  if (portal && process.env.PORTAL_ENABLED !== "1") {
    const url = req.nextUrl.clone(); url.pathname = "/giris"; url.search = "";
    return finish(NextResponse.redirect(url));
  }

  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (admin && session && CMS.includes(session.role)) {
    if (session.mustChangePassword && path !== "/admin/sifre-degistir") {
      const url = req.nextUrl.clone(); url.pathname = "/admin/sifre-degistir"; url.search = "";
      return finish(NextResponse.redirect(url));
    }
    return finish(NextResponse.next({ request: { headers } }));
  }
  if (portal && session?.role === "mentor" && session.teamNum) {
    if (session.mustChangePassword && path !== "/portal/ayarlar") {
      const url = req.nextUrl.clone(); url.pathname = "/portal/ayarlar"; url.search = "";
      return finish(NextResponse.redirect(url));
    }
    return finish(NextResponse.next({ request: { headers } }));
  }
  const url = req.nextUrl.clone(); url.pathname = admin ? "/cms-giris" : "/giris"; url.searchParams.set("next", path);
  return finish(NextResponse.redirect(url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|ico|svg|woff2?|ttf|css|js|map)).*)"] };
