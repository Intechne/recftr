import { NextRequest, NextResponse } from "next/server";
import { contentSession } from "@/lib/auth";
import { listPages } from "@/lib/db";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){try{const all=req.nextUrl.searchParams.get("all")==="1";if(all&&!(await contentSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listPages(all));}catch(e){return apiError(e,'Sayfalar alınamadı.');}}
