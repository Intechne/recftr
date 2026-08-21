import { NextRequest, NextResponse } from "next/server";
import { cmsSession } from "@/lib/auth";
import { getStats } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){ if(!(await cmsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401}); return NextResponse.json(await getStats()); }
