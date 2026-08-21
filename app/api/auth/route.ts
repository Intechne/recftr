import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, type SessionRole } from "@/lib/session";
import { findUserByEmail, verifyPassword } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, pass, scope } = await req.json();
  const normalized = String(email ?? "").toLowerCase().trim();
  const password = String(pass ?? "");
  if (!normalized || !password) return NextResponse.json({ error: "E-posta ve şifre zorunlu." }, { status: 400 });

  let user: { email:string; name:string; role:SessionRole; teamNum?:string|null } | null = null;
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  if (adminEmail && normalized === adminEmail && password === process.env.ADMIN_PASSWORD) {
    user = { email: normalized, name: "Süper Yönetici", role: "admin", teamNum: null };
  } else {
    const dbUser = await findUserByEmail(normalized);
    if (dbUser?.active && verifyPassword(password, dbUser.password_hash)) {
      user = { email: dbUser.email, name: dbUser.name, role: dbUser.role, teamNum: dbUser.team_num };
    }
  }
  if (!user) return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  if (scope === "cms" && user.role === "mentor") return NextResponse.json({ error: "Bu hesap takım portalına aittir." }, { status: 403 });
  if (scope !== "cms" && user.role !== "mentor") return NextResponse.json({ error: "Bu hesap CMS yönetimine aittir." }, { status: 403 });
  if (user.role === "mentor" && !user.teamNum) return NextResponse.json({ error: "Bu mentor hesabına takım atanmadı." }, { status: 403 });

  try {
    const token = await createSessionToken({ role:user.role,email:user.email,name:user.name,teamNum:user.teamNum });
    const res = NextResponse.json({ ok:true, role:user.role, name:user.name, teamNum:user.teamNum });
    res.cookies.set("recf_session", token, { httpOnly:true,sameSite:"lax",path:"/",maxAge:60*60*8,secure:process.env.NODE_ENV==="production" });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sunucu oturum yapılandırması eksik." }, { status: 503 });
  }
}
export async function DELETE(){ const res=NextResponse.json({ok:true}); res.cookies.set("recf_session","",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:0}); return res; }
