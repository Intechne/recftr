import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
const CMS=["admin","editor","approvals","technical"];
export async function middleware(req:NextRequest){
  const s=await verifySessionToken(req.cookies.get("recf_session")?.value); const p=req.nextUrl.pathname;
  const admin=p.startsWith("/admin"), portal=p.startsWith("/portal"); if(!admin&&!portal)return NextResponse.next();
  if(admin&&s&&CMS.includes(s.role))return NextResponse.next(); if(portal&&s?.role==="mentor"&&s.teamNum)return NextResponse.next();
  const url=req.nextUrl.clone();url.pathname=admin?"/cms-giris":"/giris";url.searchParams.set("next",p);return NextResponse.redirect(url);
}
export const config={matcher:["/admin/:path*","/portal/:path*"]};
