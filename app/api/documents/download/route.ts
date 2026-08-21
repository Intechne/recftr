import { NextRequest, NextResponse } from "next/server";
import { incrementDocumentDownload, listDocuments } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){ const id=Number(req.nextUrl.searchParams.get("id")); const docs=await listDocuments(false); const d=docs.find((x:any)=>Number(x.id)===id); if(!d)return NextResponse.json({error:"Dosya bulunamadı"},{status:404}); await incrementDocumentDownload(id); return NextResponse.redirect(d.url); }
