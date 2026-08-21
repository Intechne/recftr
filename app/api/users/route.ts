import { NextRequest, NextResponse } from "next/server";
import { adminSession } from "@/lib/auth";
import { audit, deleteUser, listUsers, saveUser, tempPassword } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!(await adminSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listUsers());}
export async function POST(req:NextRequest){const s=await adminSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401});const b=await req.json();if(!b.email||!b.name||!b.role)return NextResponse.json({error:"E-posta, ad ve rol zorunlu"},{status:400});let generated="";if(!b.password){generated=tempPassword();b.password=generated;}const r=await saveUser(b);await audit(s.email,"create","user",String(r.id),{email:b.email,role:b.role});return NextResponse.json({...r,temporaryPassword:generated||undefined},{status:201});}
export async function PUT(req:NextRequest){const s=await adminSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401});const b=await req.json();const r=await saveUser(b);await audit(s.email,"update","user",String(b.id),{email:b.email,role:b.role});return NextResponse.json(r);}
export async function DELETE(req:NextRequest){const s=await adminSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:401});const {id}=await req.json();await deleteUser(Number(id));await audit(s.email,"delete","user",String(id));return NextResponse.json({ok:true});}
