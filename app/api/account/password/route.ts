import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";
import { audit, changeOwnPassword } from "@/lib/db";
import { apiError } from "@/lib/api-server";

export async function POST(req: NextRequest) {
  try {
    const session = await sessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const bootstrapEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (session.role === "admin" && bootstrapEmail && session.email.toLowerCase() === bootstrapEmail) {
      return NextResponse.json({ error: "Bootstrap yöneticisinin şifresi sunucu ortam değişkeninden değiştirilir." }, { status: 403 });
    }
    const body = await req.json();
    const next = String(body.next || "");
    const current = String(body.current || "");
    if (next.length < 12 || next.length > 256) return NextResponse.json({ error: "Yeni şifre en az 12 karakter olmalı." }, { status: 400 });
    if (next === current) return NextResponse.json({ error: "Yeni şifre mevcut şifre ile aynı olamaz." }, { status: 400 });
    if (!(await changeOwnPassword(session.email, current, next))) return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });
    await audit(session.email, "password_changed", "security", "account", {});
    const response = NextResponse.json({ ok: true, relogin: true });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0, priority: "high" });
    return response;
  } catch (error) {
    return apiError(error, "Şifre değiştirilemedi.");
  }
}
