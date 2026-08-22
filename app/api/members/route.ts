import { NextRequest, NextResponse } from "next/server";
import { portalSession } from "@/lib/auth";
import { createMember, deleteMember, listMembers, updateMember } from "@/lib/db";
import { apiError } from "@/lib/api-server";
import { cleanText, validEmail } from "@/lib/security";
export const dynamic="force-dynamic";
function clean(b:any){const name=cleanText(b.name,120),email=cleanText(b.email,254).toLowerCase();if(!name)return {error:'Ad soyad zorunlu'};if(email&&!validEmail(email))return {error:'E-posta adresi geçersiz'};return {name,email,role:cleanText(b.role,40)||'ÜYE',cat:cleanText(b.cat,60)||'—',consent:cleanText(b.consent,60)||'—',status:cleanText(b.status,30)||'AKTİF'};}
export async function GET(req:NextRequest){try{const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listMembers(s.teamNum));}catch(e){return apiError(e,'Üyeler alınamadı.');}}
export async function POST(req:NextRequest){try{const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});const b:any=clean(await req.json());if(b.error)return NextResponse.json({error:b.error},{status:400});return NextResponse.json(await createMember(s.teamNum,b),{status:201});}catch(e){return apiError(e,'Üye eklenemedi.');}}
export async function PUT(req:NextRequest){try{const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});const raw=await req.json();const b:any=clean(raw);if(b.error)return NextResponse.json({error:b.error},{status:400});const r=await updateMember(s.teamNum,Number(raw.id),b);return r?NextResponse.json(r):NextResponse.json({error:'Üye bulunamadı.'},{status:404});}catch(e){return apiError(e,'Üye güncellenemedi.');}}
export async function DELETE(req:NextRequest){try{const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});const {id}=await req.json();await deleteMember(s.teamNum,Number(id));return NextResponse.json({ok:true});}catch(e){return apiError(e,'Üye silinemedi.');}}
