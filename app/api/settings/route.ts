import { NextRequest, NextResponse } from "next/server";
import { adminSession, contentSession } from "@/lib/auth";
import { getSettings, setSettingsAtomic } from "@/lib/db";
import { apiError } from "@/lib/api-server";
import { cleanText, validHttpUrl } from "@/lib/security";
import { currentContentRevision, publishContentChange, PUBLIC_SETTING_KEYS } from "@/lib/content-consistency";

export const dynamic="force-dynamic";
export const revalidate=0;

const PUBLIC=[...PUBLIC_SETTING_KEYS];
const CONTENT=[...PUBLIC];
const FINANCIAL=["registration_fee_engage","registration_fee_achieve","registration_fee_inspire","registration_fee_adc","registration_fee_adc-pro","field_kit_fee","registration_discount","registration_enabled"];
const ALL=new Set([...CONTENT,...FINANCIAL]);
const URL_KEYS=new Set(["instagram","youtube","linkedin","hero_image","site_logo","site_mark","favicon_url","apple_touch_icon_url","og_image"]);
const NO_STORE={"Cache-Control":"private, no-store, max-age=0","Pragma":"no-cache"};

export async function GET(req:NextRequest){
  try{
    const revision=await currentContentRevision();
    const headers={...NO_STORE,"X-Content-Revision":revision};
    const admin=await adminSession(req);if(admin)return NextResponse.json(await getSettings([...ALL]),{headers});
    const editor=await contentSession(req);if(editor)return NextResponse.json(await getSettings(CONTENT),{headers});
    return NextResponse.json(await getSettings(PUBLIC),{headers});
  }catch(e){return apiError(e,'Site ayarları alınamadı.');}
}

export async function PUT(req:NextRequest){
  try{
    const editor=await contentSession(req);if(!editor)return NextResponse.json({error:"CMS içerik düzenleme yetkisi gerekli."},{status:403});
    const b=await req.json();const entries=Object.entries(b);
    if(entries.length>80)return NextResponse.json({error:'Çok fazla ayar gönderildi.'},{status:400});
    const unknown=entries.map(([k])=>k).filter(k=>!ALL.has(k));if(unknown.length)return NextResponse.json({error:'İzin verilmeyen ayar anahtarı.'},{status:400});
    const touchesFinancial=entries.some(([k])=>FINANCIAL.includes(k));
    if(touchesFinancial&&!(await adminSession(req)))return NextResponse.json({error:'Kayıt ücretleri ve finansal ayarlar yalnız admin tarafından değiştirilebilir.'},{status:403});

    // Prevent an older CMS tab from silently overwriting a newer save.
    const expectedRevision=String(req.headers.get("if-match")||"").replace(/^W\//,"").replace(/^"|"$/g,"");
    if(expectedRevision&&expectedRevision!=="0"){
      const currentRevision=await currentContentRevision();
      if(currentRevision!==expectedRevision){
        return NextResponse.json({error:'Bu ayarlar başka bir CMS oturumunda değiştirildi. Güncel veriyi yükleyip değişikliklerinizi yeniden uygulayın.',code:'CONTENT_REVISION_CONFLICT',currentRevision},{status:409,headers:NO_STORE});
      }
    }

    const normalized:Array<[string,string]>=[];
    for(const [k,v] of entries){
      const raw=String(v??'').trim();
      if(raw.length>20000)return NextResponse.json({error:`${k} değeri çok uzun.`},{status:400});
      if(URL_KEYS.has(k)&&raw&&!validHttpUrl(raw))return NextResponse.json({error:`${k} için yalnız güvenli HTTPS URL kullanılabilir.`},{status:400});
      normalized.push([k,raw]);
    }

    // One transaction: public visitors can never observe a half-written settings form.
    const revision=await setSettingsAtomic(normalized);
    await publishContentChange(["/","/programlar","/hakkimizda","/kayit"],revision);
    const persisted=await getSettings(normalized.map(([k])=>k));
    return NextResponse.json({ok:true,revision,settings:persisted},{headers:NO_STORE});
  }catch(e){return apiError(e,'Site ayarları kaydedilemedi.');}
}
