import { NextRequest, NextResponse } from "next/server";
import { listMembers, inviteMember } from "@/lib/db";
import { verifySessionToken } from "@/lib/session";
export const dynamic = "force-dynamic";
const TEAM = "905A"; // demo oturumun takımı

async function authed(req: NextRequest) {
  const role = await verifySessionToken(req.cookies.get("recf_session")?.value);
  return role === "mentor" || role === "admin";
}
export async function GET(req: NextRequest) {
  if (!(await authed(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(await listMembers(TEAM));
}
export async function POST(req: NextRequest) {
  if (!(await authed(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { email } = await req.json();
  if (!email?.includes("@")) return NextResponse.json({ error: "Geçerli e-posta girin." }, { status: 400 });
  await inviteMember(TEAM, email);
  return NextResponse.json({ ok: true }, { status: 201 });
}
