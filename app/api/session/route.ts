import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){ const s=await sessionFromRequest(req); return s?NextResponse.json(s):NextResponse.json({error:"Oturum yok"},{status:401}); }
