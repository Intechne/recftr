import { NextRequest, NextResponse } from "next/server";
import { contactSession } from "@/lib/auth";
import { createContact, listContacts, updateContact } from "@/lib/db";
import { apiError } from "@/lib/api-server";
import { cleanText, clientIp, enforceRateLimit, rateLimitResponse, validEmail } from "@/lib/security";
import {notifySubmission} from "@/lib/submission-notifications";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){try{const ip=clientIp(req);const rl=await enforceRateLimit(req,'contact-ip',ip,5,10*60);if(!rl.ok)return rateLimitResponse(rl.retryAfter);const b=await req.json();if(String(b.website||'').trim())return NextResponse.json({ok:true},{status:201});const name=cleanText(b.name,120),email=cleanText(b.email,254).toLowerCase(),message=cleanText(b.message,5000);if(!name||!validEmail(email)||!message)return NextResponse.json({error:"Ad, geçerli e-posta ve mesaj zorunlu"},{status:400});const record=await createContact({name,email,phone:cleanText(b.phone,40),subject:cleanText(b.subject,160),message});await notifySubmission('contact',Number(record.id));return NextResponse.json({id:Number(record.id),ok:true},{status:201});}catch(e){return apiError(e,'Mesaj gönderilemedi.');}}
export async function GET(req:NextRequest){try{if(!(await contactSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:403});return NextResponse.json(await listContacts());}catch(e){return apiError(e,'İletişim mesajları alınamadı.');}}
export async function PATCH(req:NextRequest){try{if(!(await contactSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:403});const b=await req.json();const status=cleanText(b.status,30);if(!['YENİ','OKUNDU','CEVAPLANDI'].includes(status))return NextResponse.json({error:'Geçersiz durum.'},{status:400});await updateContact(Number(b.id),status);return NextResponse.json({ok:true});}catch(e){return apiError(e,'Mesaj durumu güncellenemedi.');}}
