import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getSettings, setSetting } from "@/lib/db";
export const dynamic = "force-dynamic";
const PUBLIC_KEYS = ["ticker", "contact_team", "contact_info", "maintenance"];

export async function GET(req: NextRequest) {
  const admin = (await verifySessionToken(req.cookies.get("recf_session")?.value)) === "admin";
  const s = await getSettings(admin ? undefined : PUBLIC_KEYS);
  return NextResponse.json(s);
}
export async function PUT(req: NextRequest) {
  if ((await verifySessionToken(req.cookies.get("recf_session")?.value)) !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json() as Record<string, string>;
  for (const [k, v] of Object.entries(b)) await setSetting(k, String(v));
  return NextResponse.json({ ok: true });
}
