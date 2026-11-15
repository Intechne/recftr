import {NextRequest,NextResponse} from "next/server";
import {contentSession} from "@/lib/auth";
import {audit,deletePartner,listPartners,savePartner} from "@/lib/db";
import {verifyPublicImageReference} from "@/lib/storage";
import {cleanText,validHttpUrl} from "@/lib/security";
import {apiError} from "@/lib/api-server";
import {publishContentChange} from "@/lib/content-consistency";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){try{const all=req.nextUrl.searchParams.get("all")==="1";if(all&&!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listPartners(all));}catch(e){return apiError(e,"Partnerler alınamadı.");}}
export async function PUT(req:NextRequest){
  try{
    const s=await contentSession(req);if(!s)return NextResponse.json({error:"CMS içerik düzenleme yetkisi gerekli."},{status:403});
    const b=await req.json();const name=cleanText(b.name,160),logo=cleanText(b.logo_url,1000),site=cleanText(b.website_url,500);
    if(!name)return NextResponse.json({error:"Kurum adı zorunlu."},{status:400});
    if(b.published===true&&!logo)return NextResponse.json({error:"Yayınlanacak partner için logo zorunlu."},{status:400});
    if(logo){if(!validHttpUrl(logo))return NextResponse.json({error:"Logo URL geçersiz."},{status:400});const imageError=await verifyPublicImageReference(logo);if(imageError)return NextResponse.json({error:imageError},{status:400});}
    if(site&&!validHttpUrl(site))return NextResponse.json({error:"Web sitesi için güvenli HTTPS adresi girin."},{status:400});
    const r=await savePartner({id:b.id?Number(b.id):undefined,name,logo_url:logo,website_url:site,tier:cleanText(b.tier,60),sort_order:Math.max(-1000,Math.min(1000,Number(b.sort_order)||0)),published:b.published===true});
    if(!r)return NextResponse.json({error:"Partner bulunamadı."},{status:404});
    await audit(s.email,"save","partner",String(r.id),{name});await publishContentChange(["/is-birlikleri"]);return NextResponse.json(r);
  }catch(e){return apiError(e,"Partner kaydedilemedi.");}
}
export async function DELETE(req:NextRequest){
  try{
    const s=await contentSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:403});
    const id=Number((await req.json())?.id);if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:"Geçersiz partner."},{status:400});
    const r=await deletePartner(id);if(!r)return NextResponse.json({error:"Partner bulunamadı."},{status:404});
    await audit(s.email,"delete","partner",String(id),{name:r.name});await publishContentChange(["/is-birlikleri"]);return NextResponse.json({ok:true});
  }catch(e){return apiError(e,"Partner silinemedi.");}
}
