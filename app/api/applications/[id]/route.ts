import { NextRequest, NextResponse } from "next/server";
import { approvalsSession } from "@/lib/auth";
import { audit, resolveApplication } from "@/lib/db";
export const dynamic="force-dynamic";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){ const s=await approvalsSession(req); if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401}); const {id}=await params; const {action}=await req.json(); if(!["approve","reject"].includes(action))return NextResponse.json({error:"Geçersiz işlem"},{status:400}); const out=await resolveApplication(Number(id),action); if(!out)return NextResponse.json({error:"Başvuru yok"},{status:404}); await audit(s.email,action,"application",id,{num:out.app.num}); return NextResponse.json({ok:true,num:out.app.num,action,temporaryPassword:out.temporaryPassword}); }
