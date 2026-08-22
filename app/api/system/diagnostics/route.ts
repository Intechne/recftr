import { NextRequest, NextResponse } from "next/server";
import { adminSession } from "@/lib/auth";
import { dbDiagnostics } from "@/lib/db";
import { storageDiagnostics } from "@/lib/storage";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  if(!(await adminSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});
  const [db,storage]=await Promise.all([dbDiagnostics(),storageDiagnostics()]);
  const sessionSecret=String(process.env.SESSION_SECRET||'');
  return NextResponse.json({
    ok:db.ok&&storage.ok&&sessionSecret.length>=32,
    env:{sessionSecret:sessionSecret.length>=32,adminEmail:!!process.env.ADMIN_EMAIL,adminPassword:!!process.env.ADMIN_PASSWORD,adminTotp:!!process.env.ADMIN_TOTP_SECRET,rateLimitSalt:!!process.env.RATE_LIMIT_SALT},
    db,storage,
    security:{sessionRevocation:true,apiNoStore:true,csrfOriginGuard:true,rateLimitTable:!db.missingTables?.includes?.('security_rate_limits'),leastPrivilegeDb:db.leastPrivilege===true},
    version:"3.1.2"
  },{headers:{'Cache-Control':'no-store'}});
}
