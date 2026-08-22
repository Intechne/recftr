import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){const s=await sessionFromRequest(req);return s?NextResponse.json({role:s.role,email:s.email,name:s.name,teamNum:s.teamNum,mustChangePassword:!!s.mustChangePassword},{headers:{'Cache-Control':'no-store'}}):NextResponse.json({error:"Oturum yok"},{status:401,headers:{'Cache-Control':'no-store'}});}
