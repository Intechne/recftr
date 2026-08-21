import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, type SessionRole } from "@/lib/session";
export const dynamic = "force-dynamic";

function users(): Record<string, { pass: string; role: SessionRole }> {
  const isProd = process.env.NODE_ENV === "production";
  const adminEmail = process.env.ADMIN_EMAIL ?? (isProd ? "" : "admin@recfturkiye.org");
  const adminPassword = process.env.ADMIN_PASSWORD ?? (isProd ? "" : "recf2026");
  const mentorEmail = process.env.MENTOR_EMAIL ?? (isProd ? "" : "mentor@voltran.org");
  const mentorPassword = process.env.MENTOR_PASSWORD ?? (isProd ? "" : "905a");

  const result: Record<string, { pass: string; role: SessionRole }> = {};
  if (adminEmail && adminPassword) result[adminEmail.toLowerCase().trim()] = { pass: adminPassword, role: "admin" };
  if (mentorEmail && mentorPassword) result[mentorEmail.toLowerCase().trim()] = { pass: mentorPassword, role: "mentor" };
  return result;
}

export async function POST(req: NextRequest) {
  const { email, pass } = await req.json();
  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const u = users()[normalizedEmail];
  if (!u || u.pass !== pass)
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });

  try {
    const token = await createSessionToken(u.role);
    const res = NextResponse.json({ ok: true, role: u.role });
    res.cookies.set("recf_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (error) {
    console.error("Session configuration error", error);
    return NextResponse.json({ error: "Sunucu oturum yapılandırması eksik." }, { status: 503 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("recf_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
