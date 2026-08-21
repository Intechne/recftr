import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const role = await verifySessionToken(req.cookies.get("recf_session")?.value);
  const { pathname } = req.nextUrl;
  const need = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/portal") ? "mentor" : null;
  if (!need) return NextResponse.next();
  const ok = need === "admin" ? role === "admin" : role === "mentor" || role === "admin";
  if (ok) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/giris";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/admin", "/portal/:path*", "/portal"] };
