import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { deletePage, getPage, savePage } from "@/lib/db";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest,{params}:{params:Promise<{slug:string}>}){try{const {slug}=await params;const all=req.nextUrl.searchParams.get("all")==="1";if(all&&!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const p=await getPage(slug,all);return p?NextResponse.json(p):NextResponse.json({error:"Sayfa yok"},{status:404});}catch(e){return apiError(e,'Sayfa alınamadı.');}}
export async function PUT(req:NextRequest,{params}:{params:Promise<{slug:string}>}){try{if(!(await contentSession(req)))return NextResponse.json({error:"CMS içerik düzenleme yetkisi gerekli."},{status:401});const {slug}=await params;const b=await req.json();return NextResponse.json(await savePage(slug,b.title,b.body??"",b.published!==false));}catch(e){return apiError(e,'Sayfa kaydedilemedi.');}}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{slug:string}>}){try{if(!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const {slug}=await params;await deletePage(slug);return NextResponse.json({ok:true});}catch(e){return apiError(e,'Sayfa silinemedi.');}}
