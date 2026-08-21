import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { deleteEvent, listEvents, upsertEvent } from "@/lib/db";
export const dynamic = "force-dynamic";
const isAdmin = async (r: NextRequest) => (await verifySessionToken(r.cookies.get("recf_session")?.value)) === "admin";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (all && !isAdmin(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(await listEvents(!all));
}
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json();
  if (!b.slug?.trim() || !b.title?.trim() || !b.code?.trim() || !b.city?.trim() || !b.date_label?.trim())
    return NextResponse.json({ error: "slug, başlık, program, şehir ve tarih zorunlu." }, { status: 400 });
  if (!/^[a-z0-9-]{3,48}$/.test(b.slug)) return NextResponse.json({ error: "Slug: küçük harf/rakam/tire." }, { status: 400 });
  await upsertEvent({ ...b, capacity: Number(b.capacity) || 64, registered: Number(b.registered) || 0 });
  return NextResponse.json({ ok: true, slug: b.slug }, { status: 201 });
}
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { slug } = await req.json();
  await deleteEvent(slug);
  return NextResponse.json({ ok: true });
}
