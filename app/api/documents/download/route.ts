import { NextRequest, NextResponse } from "next/server";
import { incrementDocumentDownload, listDocuments } from "@/lib/db";
import { pathFromPublicUrl, safeStoragePath } from "@/lib/storage";
import { validHttpUrl } from "@/lib/security";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
  const id=Number(req.nextUrl.searchParams.get("id"));if(!Number.isFinite(id)||id<=0)return NextResponse.json({error:"Geçersiz doküman"},{status:400});
  const docs=await listDocuments(false);const d=docs.find((x:any)=>Number(x.id)===id);if(!d)return NextResponse.json({error:"Dosya bulunamadı"},{status:404});
  const url=String(d.url||'');const path=pathFromPublicUrl(url);if(path&&!safeStoragePath(path,'documents'))return NextResponse.json({error:'Doküman yolu geçersiz.'},{status:400});if(!path&&!validHttpUrl(url,true))return NextResponse.json({error:'Doküman bağlantısı geçersiz.'},{status:400});
  await incrementDocumentDownload(id);const target=url.startsWith("/")?new URL(url,req.url):new URL(url);return NextResponse.redirect(target);
}
