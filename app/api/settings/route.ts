import { NextRequest, NextResponse } from "next/server";
import { adminSession, contentSession } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/db";
import {apiError} from "@/lib/api-server";
import { cleanText, validHttpUrl } from "@/lib/security";
export const dynamic="force-dynamic";

const PUBLIC=["site_name","hero_title","hero_accent_title","hero_description","hero_image","ticker","contact_team","contact_info","contact_phone","instagram","youtube","linkedin","maintenance","site_logo","site_mark","favicon_url","apple_touch_icon_url","og_image","season_label","season_route_title","season_route","home_cta_title","home_cta_description","home_cta_plate","home_show_programs","home_show_route","home_show_stats","home_show_events","home_show_news","home_show_gallery","home_show_cta"];
const CONTENT=[...PUBLIC];
const FINANCIAL=["registration_fee_engage","registration_fee_achieve","registration_fee_inspire","registration_fee_adc","registration_fee_adc-pro","field_kit_fee","registration_discount","registration_enabled"];
const ALL=new Set([...CONTENT,...FINANCIAL]);
const URL_KEYS=new Set(["instagram","youtube","linkedin","hero_image","site_logo","site_mark","favicon_url","apple_touch_icon_url","og_image"]);

export async function GET(req:NextRequest){
  try{
    const admin=await adminSession(req);if(admin)return NextResponse.json(await getSettings([...ALL]));
    const editor=await contentSession(req);if(editor)return NextResponse.json(await getSettings(CONTENT));
    return NextResponse.json(await getSettings(PUBLIC));
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
    for(const [k,v] of entries){const raw=String(v??'').trim();if(raw.length>20000)return NextResponse.json({error:`${k} değeri çok uzun.`},{status:400});if(URL_KEYS.has(k)&&raw&&!validHttpUrl(raw))return NextResponse.json({error:`${k} için yalnız güvenli HTTPS URL kullanılabilir.`},{status:400});await setSetting(k,raw);}
    return NextResponse.json({ok:true});
  }catch(e){return apiError(e,'Site ayarları kaydedilemedi.');}
}
