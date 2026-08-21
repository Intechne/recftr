import { NextRequest, NextResponse } from "next/server";
import { adminSession } from "@/lib/auth";
import { listAudit } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){if(!(await adminSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listAudit(100));}
