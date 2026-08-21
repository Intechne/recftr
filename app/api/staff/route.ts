import { NextResponse } from "next/server";
import { listPublicStaff } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json(await listPublicStaff());}
