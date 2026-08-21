import { NextRequest, NextResponse } from "next/server";
import { portalSession } from "@/lib/auth";
import { createMember, deleteMember, listMembers, updateMember } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){ const s=await portalSession(req); if(!s||!s.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401}); return NextResponse.json(await listMembers(s.teamNum)); }
export async function POST(req:NextRequest){ const s=await portalSession(req); if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401}); const b=await req.json(); if(!String(b.name??"").trim())return NextResponse.json({error:"Ad soyad zorunlu"},{status:400}); return NextResponse.json(await createMember(s.teamNum,b),{status:201}); }
export async function PUT(req:NextRequest){ const s=await portalSession(req); if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401}); const b=await req.json(); return NextResponse.json(await updateMember(s.teamNum,Number(b.id),b)); }
export async function DELETE(req:NextRequest){ const s=await portalSession(req); if(!s?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401}); const {id}=await req.json(); await deleteMember(s.teamNum,Number(id)); return NextResponse.json({ok:true}); }
