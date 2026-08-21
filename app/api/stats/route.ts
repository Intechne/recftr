import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getStats } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if ((await verifySessionToken(req.cookies.get("recf_session")?.value)) !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(await getStats());
}
