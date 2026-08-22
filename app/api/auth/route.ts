import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, type SessionRole } from "@/lib/session";
import { audit, findUserByEmail, hashPassword, verifyPassword } from "@/lib/db";
import { bootstrapSessionVersion, clientIp, enforceRateLimit, rateLimitResponse, safeEqual, securityHash } from "@/lib/security";
import { verifyTotp } from "@/lib/totp";

export const dynamic = "force-dynamic";
const DUMMY_PASSWORD_HASH = hashPassword("RECF-dummy-password-never-valid-2026!");

function noStoreJson(body: unknown, init?: {status?:number}) {
  return NextResponse.json(body, { status:init?.status, headers:{"Cache-Control":"no-store"} });
}

export async function POST(req: NextRequest) {
  let raw:any={};
  try { raw = await req.json(); } catch { return noStoreJson({error:"Geçersiz istek."},{status:400}); }
  const normalized = String(raw.email ?? "").toLowerCase().trim().slice(0,254);
  const password = String(raw.pass ?? "").slice(0,256);
  const scope = String(raw.scope ?? "");
  const otp = String(raw.otp ?? "").replace(/\s+/g, "").slice(0,12);
  if (!normalized || !password || !["cms","portal"].includes(scope)) return noStoreJson({ error: "E-posta ve şifre zorunlu." }, { status: 400 });

  const ip = clientIp(req);
  const ipLimit = await enforceRateLimit(req, "login-ip", ip, 20, 15*60);
  if (!ipLimit.ok) return rateLimitResponse(ipLimit.retryAfter);
  const accountLimit = await enforceRateLimit(req, "login-account-ip", `${normalized}:${ip}`, 8, 15*60);
  if (!accountLimit.ok) return rateLimitResponse(accountLimit.retryAfter);

  let user: { email:string; name:string; role:SessionRole; teamNum?:string|null; sv:number; mustChangePassword?:boolean; mfaSecret?:string } | null = null;
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const adminPassword = String(process.env.ADMIN_PASSWORD ?? "");
  if (adminEmail && normalized === adminEmail && adminPassword && safeEqual(password, adminPassword)) {
    const adminTotp = String(process.env.ADMIN_TOTP_SECRET || "").trim();
    if (adminTotp && !verifyTotp(adminTotp, otp)) {
      await audit(normalized,"login_mfa_failed","security","auth",{scope,ip_hash:securityHash(ip)});
      return noStoreJson({ error: "E-posta, şifre veya doğrulama kodu hatalı." }, { status: 401 });
    }
    user = { email: normalized, name: "Süper Yönetici", role: "admin", teamNum: null, sv:bootstrapSessionVersion(adminPassword), mustChangePassword:false };
  } else {
    const dbUser = await findUserByEmail(normalized);
    const eligible = !!dbUser?.active && ["admin","editor","approvals","technical","mentor"].includes(String(dbUser.role));
    const passwordOk = eligible ? verifyPassword(password, dbUser.password_hash) : (verifyPassword(password, DUMMY_PASSWORD_HASH), false);
    if (eligible && passwordOk) {
      const mfaSecret=String(dbUser.mfa_secret||"");
      if (mfaSecret && !verifyTotp(mfaSecret, otp)) {
        await audit(normalized,"login_mfa_failed","security","auth",{scope,ip_hash:securityHash(ip)});
        return noStoreJson({ error: "E-posta, şifre veya doğrulama kodu hatalı." }, { status: 401 });
      }
      user = {
        email: String(dbUser.email), name: String(dbUser.name), role: dbUser.role as SessionRole,
        teamNum: dbUser.team_num ? String(dbUser.team_num) : null,
        sv: Number(dbUser.session_version || 1), mustChangePassword: !!dbUser.must_change_password,
        mfaSecret,
      };
    }
  }
  if (!user) {
    await audit(normalized||"unknown","login_failed","security","auth",{scope,ip_hash:securityHash(ip)});
    return noStoreJson({ error: "E-posta, şifre veya doğrulama kodu hatalı." }, { status: 401 });
  }
  if (scope === "cms" && user.role === "mentor") return noStoreJson({ error: "Bu hesap takım portalına aittir." }, { status: 403 });
  if (scope !== "cms" && user.role !== "mentor") return noStoreJson({ error: "Bu hesap CMS yönetimine aittir." }, { status: 403 });
  if (user.role === "mentor" && !user.teamNum) return noStoreJson({ error: "Bu mentor hesabına takım atanmadı." }, { status: 403 });

  try {
    const token = await createSessionToken({ role:user.role,email:user.email,name:user.name,teamNum:user.teamNum,sv:user.sv,mustChangePassword:user.mustChangePassword });
    const res = noStoreJson({ ok:true, role:user.role, name:user.name, teamNum:user.teamNum, mustChangePassword:!!user.mustChangePassword, mfaEnabled:!!user.mfaSecret });
    const maxAge = 60*60*(user.role==="mentor"?8:4);
    res.cookies.set(SESSION_COOKIE, token, { httpOnly:true,sameSite:"lax",path:"/",maxAge,secure:process.env.NODE_ENV==="production",priority:"high" });
    await audit(user.email,"login_success","security","auth",{scope,role:user.role,ip_hash:securityHash(ip)});
    return res;
  } catch (e) {
    console.error(e);
    return noStoreJson({ error: "Sunucu oturum yapılandırması eksik." }, { status: 503 });
  }
}
export async function DELETE(req:NextRequest){
  const res=noStoreJson({ok:true});
  res.cookies.set(SESSION_COOKIE,"",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:0,priority:"high"});
  return res;
}
