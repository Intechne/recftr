import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { audit, deletePage, getPage, savePage } from "@/lib/db";
import {apiError} from "@/lib/api-server";
import {cleanText} from "@/lib/security";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest,{params}:{params:Promise<{slug:string}>}){try{const {slug}=await params;const all=req.nextUrl.searchParams.get("all")==="1";if(all&&!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const p=await getPage(slug,all);return p?NextResponse.json(p):NextResponse.json({error:"Sayfa yok"},{status:404});}catch(e){return apiError(e,'Sayfa alınamadı.');}}
export async function PUT(req:NextRequest,{params}:{params:Promise<{slug:string}>}){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:"CMS içerik düzenleme yetkisi gerekli."},{status:401});const {slug}=await params;const b=await req.json();const title=cleanText(b.title,220),body=cleanText(b.body,150000);if(!title)return NextResponse.json({error:'Sayfa başlığı zorunludur.'},{status:400});const r=await savePage(slug,title,body,b.published!==false);await audit(s.email,'save','page',slug,{title});return NextResponse.json(r);}catch(e){return apiError(e,'Sayfa kaydedilemedi.');}}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{slug:string}>}){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401});const {slug}=await params;await deletePage(slug);await audit(s.email,'delete','page',slug);return NextResponse.json({ok:true});}catch(e){return apiError(e,'Sayfa silinemedi.');}}
