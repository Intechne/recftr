import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/db";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";
const PUBLIC=["site_name","hero_title","hero_accent_title","hero_description","hero_image","ticker","contact_team","contact_info","contact_phone","instagram","youtube","linkedin","maintenance","site_logo","site_mark","favicon_url","apple_touch_icon_url","og_image","season_label","season_route_title","season_route","home_cta_title","home_cta_description","home_cta_plate","home_show_programs","home_show_route","home_show_stats","home_show_events","home_show_news","home_show_gallery","home_show_cta"];
export async function GET(req:NextRequest){try{const cms=await contentSession(req);return NextResponse.json(await getSettings(cms?undefined:PUBLIC));}catch(e){return apiError(e,'Site ayarları alınamadı.');}}
export async function PUT(req:NextRequest){try{if(!(await contentSession(req)))return NextResponse.json({error:"CMS içerik düzenleme yetkisi gerekli."},{status:401});const b=await req.json();for(const [k,v] of Object.entries(b))await setSetting(k,String(v));return NextResponse.json({ok:true});}catch(e){return apiError(e,'Site ayarları kaydedilemedi.');}}
