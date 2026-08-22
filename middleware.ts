import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const CMS = ["admin","editor","approvals","technical"];
const MUTATING = new Set(["POST","PUT","PATCH","DELETE"]);

function sameOriginMutation(req: NextRequest) {
  const fetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients do not always send Origin
  try { return new URL(origin).origin === req.nextUrl.origin; } catch { return false; }
}

export async function middleware(req:NextRequest){
  const p=req.nextUrl.pathname;

  if(p.startsWith("/api/")){
    if(MUTATING.has(req.method)){
      const contentLength=Number(req.headers.get("content-length")||0);
      if(contentLength>512*1024) return NextResponse.json({error:"İstek gövdesi çok büyük."},{status:413});
      if(!sameOriginMutation(req)) return NextResponse.json({error:"Cross-site işlem reddedildi."},{status:403});
    }
    const res=NextResponse.next();
    res.headers.set("Cache-Control","private, no-store, max-age=0");
    res.headers.set("Pragma","no-cache");
    return res;
  }

  const admin=p.startsWith("/admin"), portal=p.startsWith("/portal");
  if(!admin&&!portal)return NextResponse.next();
  const s=await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if(admin&&s&&CMS.includes(s.role))return NextResponse.next();
  if(portal&&s?.role==="mentor"&&s.teamNum){
    if(s.mustChangePassword && p!=="/portal/ayarlar"){
      const u=req.nextUrl.clone();u.pathname="/portal/ayarlar";u.search="";return NextResponse.redirect(u);
    }
    return NextResponse.next();
  }
  const url=req.nextUrl.clone();url.pathname=admin?"/cms-giris":"/giris";url.searchParams.set("next",p);return NextResponse.redirect(url);
}
export const config={matcher:["/admin/:path*","/portal/:path*","/api/:path*"]};
