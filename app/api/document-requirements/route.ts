import {NextRequest,NextResponse} from "next/server";
import {docsSession} from "@/lib/auth";
import {audit,deleteDocumentRequirement,listDocumentRequirements,saveDocumentRequirement} from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!(await docsSession(req)))return NextResponse.json({error:'Yetkisiz'},{status:401});return NextResponse.json(await listDocumentRequirements(true));}
export async function POST(req:NextRequest){const s=await docsSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:401});const b=await req.json();if(!String(b.name||'').trim())return NextResponse.json({error:'Belge adı zorunlu'},{status:400});const r=await saveDocumentRequirement(b);await audit(s.email,b.id?'update':'create','document_requirement',String(r.id),{name:r.name,program:r.program});return NextResponse.json(r,{status:b.id?200:201});}
export async function DELETE(req:NextRequest){const s=await docsSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:401});const {id}=await req.json();await deleteDocumentRequirement(Number(id));await audit(s.email,'delete','document_requirement',String(id));return NextResponse.json({ok:true});}
