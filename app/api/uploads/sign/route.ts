import {NextRequest,NextResponse} from "next/server";
import {contentSession,portalSession} from "@/lib/auth";
import {createUpload,DOC_MIME,IMAGE_MIME,PRIVATE_BUCKET,PUBLIC_BUCKET,VIDEO_MIME,extensionMatchesMime,publicUrl,safeFileName} from "@/lib/storage";
import {apiError} from "@/lib/api-server";
import { clientIp, enforceRateLimit, rateLimitResponse } from "@/lib/security";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){
  try{
    const b=await req.json();
    const purpose=String(b.purpose||"");
    const mime=String(b.mimeType||"").toLowerCase().trim();
    const size=Number(b.size)||0;
    const originalName=String(b.fileName||"").trim();
    if(!originalName||originalName.length>180||!mime)return NextResponse.json({error:'Dosya adı ve MIME türü zorunludur.'},{status:400});
    const fileName=safeFileName(originalName);
    let bucket=PUBLIC_BUCKET,prefix="media",max=25*1024*1024,allowed=[...IMAGE_MIME,...VIDEO_MIME];
    let actor="";
    if(purpose==="team-doc"){
      const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});actor=s.email;
      bucket=PRIVATE_BUCKET;prefix=`teams/${s.teamNum}/documents`;max=20*1024*1024;allowed=DOC_MIME;
    }else if(purpose==="team-logo"){
      const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});actor=s.email;
      prefix=`teams/${s.teamNum}/logo`;max=5*1024*1024;allowed=IMAGE_MIME;
    }else{
      const s=await contentSession(req);if(!s)return NextResponse.json({error:"CMS içerik düzenleme yetkiniz yok."},{status:403});actor=s.email;
      if(purpose==="document"){prefix="documents";max=50*1024*1024;allowed=DOC_MIME;}
      else if(purpose!=="media")return NextResponse.json({error:"Geçersiz yükleme amacı"},{status:400});
    }
    const rl=await enforceRateLimit(req,'upload-sign',actor||clientIp(req),40,10*60);if(!rl.ok)return rateLimitResponse(rl.retryAfter);
    if(size<=0||size>max)return NextResponse.json({error:`Dosya boyutu geçersiz. En fazla ${Math.round(max/1024/1024)} MB.`},{status:400});
    if(!allowed.includes(mime)||!extensionMatchesMime(originalName,mime))return NextResponse.json({error:`Dosya uzantısı ile MIME türü eşleşmiyor veya izinli değil (${mime}).`},{status:400});
    const path=`${prefix}/${fileName}`;
    const signed=await createUpload(bucket,path,false);
    return NextResponse.json({bucket,path,signedUrl:signed.signedUrl,token:signed.token,url:bucket===PUBLIC_BUCKET?publicUrl(path):""});
  }catch(e){return apiError(e,"Yükleme bağlantısı oluşturulamadı.");}
}
