import { NextRequest, NextResponse } from "next/server";
import { adminSession } from "@/lib/auth";
import { dbDiagnostics } from "@/lib/db";
import { storageDiagnostics } from "@/lib/storage";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  if(!(await adminSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});
  const [db,storage]=await Promise.all([dbDiagnostics(),storageDiagnostics()]);
  return NextResponse.json({
    ok:db.ok&&storage.ok&&!!process.env.SESSION_SECRET,
    env:{sessionSecret:!!process.env.SESSION_SECRET,adminEmail:!!process.env.ADMIN_EMAIL,adminPassword:!!process.env.ADMIN_PASSWORD},
    db,storage,
    version:"3.0.3"
  });
}
