import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getSettings, listPayments, listTeamDocs, setSetting, setTeamDocStatus } from "@/lib/db";
export const dynamic = "force-dynamic";
const TEAM = process.env.MENTOR_TEAM_NUM ?? "905A";
const ok = async (r: NextRequest) => ["mentor", "admin"].includes((await verifySessionToken(r.cookies.get("recf_session")?.value)) ?? "");

export async function GET(req: NextRequest) {
  if (!(await ok(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const s = await getSettings([`team:${TEAM}`]);
  const profile = s[`team:${TEAM}`] ? JSON.parse(s[`team:${TEAM}`]) : { name: "", school: "", city: "", slogan: "", email: "", phone: "" };
  return NextResponse.json({ num: TEAM, profile, docs: await listTeamDocs(TEAM), payments: await listPayments(TEAM) });
}
export async function PATCH(req: NextRequest) { // belge durumu
  if (!(await ok(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await req.json();
  await setTeamDocStatus(Number(id), TEAM, "İNCELEMEDE", new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short" }));
  return NextResponse.json({ ok: true });
}
export async function PUT(req: NextRequest) { // profil
  if (!(await ok(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json();
  await setSetting(`team:${TEAM}`, JSON.stringify(b));
  return NextResponse.json({ ok: true });
}
