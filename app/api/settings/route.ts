import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { getSettings, setSetting } from "@/lib/db";
export const dynamic="force-dynamic";
const PUBLIC=["site_name","hero_title","hero_description","hero_image","ticker","contact_team","contact_info","contact_phone","instagram","youtube","linkedin","maintenance"];
export async function GET(req:NextRequest){ const cms=await contentSession(req); return NextResponse.json(await getSettings(cms?undefined:PUBLIC)); }
export async function PUT(req:NextRequest){ if(!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401}); const b=await req.json(); for(const [k,v] of Object.entries(b))await setSetting(k,String(v)); return NextResponse.json({ok:true}); }
