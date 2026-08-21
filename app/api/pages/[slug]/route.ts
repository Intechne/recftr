import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { deletePage, getPage, savePage } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest,{params}:{params:Promise<{slug:string}>}){ const {slug}=await params; const all=req.nextUrl.searchParams.get("all")==="1"; if(all&&!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401}); const p=await getPage(slug,all); return p?NextResponse.json(p):NextResponse.json({error:"Sayfa yok"},{status:404}); }
export async function PUT(req:NextRequest,{params}:{params:Promise<{slug:string}>}){ if(!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401}); const {slug}=await params; const b=await req.json(); return NextResponse.json(await savePage(slug,b.title,b.body??"",b.published!==false)); }
export async function DELETE(req:NextRequest,{params}:{params:Promise<{slug:string}>}){ if(!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401}); const {slug}=await params; await deletePage(slug); return NextResponse.json({ok:true}); }
