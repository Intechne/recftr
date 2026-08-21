import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { addMedia, audit, deleteMedia, listMedia, updateMedia } from "@/lib/db";
import { PUBLIC_BUCKET, removeObject } from "@/lib/storage";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){try{const all=req.nextUrl.searchParams.get("all")==="1";if(all&&!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listMedia(all));}catch(e){return apiError(e,'Medya listesi alınamadı.');}}
export async function POST(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:"CMS içerik düzenleme yetkisi gerekli."},{status:401});const b=await req.json();if(!b.title||!b.path||!b.url)return NextResponse.json({error:"Başlık ve yüklenen dosya zorunlu"},{status:400});const r=await addMedia(b);await audit(s.email,"create","media",String(r.id),{title:b.title});return NextResponse.json(r,{status:201});}catch(e){return apiError(e,'Medya kaydedilemedi.');}}
export async function PUT(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401});const b=await req.json();return NextResponse.json(await updateMedia(Number(b.id),b));}catch(e){return apiError(e,'Medya güncellenemedi.');}}
export async function DELETE(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401});const {id}=await req.json();const r=await deleteMedia(Number(id));if(r?.path)await removeObject(PUBLIC_BUCKET,r.path).catch(()=>{});await audit(s.email,"delete","media",String(id));return NextResponse.json({ok:true});}catch(e){return apiError(e,'Medya silinemedi.');}}
