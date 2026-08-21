import { NextRequest, NextResponse } from "next/server";
import { cmsSession } from "@/lib/auth";
import { createContact, listContacts, updateContact } from "@/lib/db";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){const b=await req.json();if(!String(b.name??"").trim()||!String(b.email??"").includes("@")||!String(b.message??"").trim())return NextResponse.json({error:"Ad, e-posta ve mesaj zorunlu"},{status:400});return NextResponse.json(await createContact(b),{status:201});}
export async function GET(req:NextRequest){if(!(await cmsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listContacts());}
export async function PATCH(req:NextRequest){if(!(await cmsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const b=await req.json();await updateContact(Number(b.id),String(b.status||"OKUNDU"));return NextResponse.json({ok:true});}
