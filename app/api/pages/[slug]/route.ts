import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { getPage, savePage } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const p = await getPage(params.slug);
  if (!p) return NextResponse.json({ error: "Sayfa yok" }, { status: 404 });
  return NextResponse.json(p);
}
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if ((await verifySessionToken(req.cookies.get("recf_session")?.value)) !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { title, body } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Başlık zorunlu." }, { status: 400 });
  await savePage(params.slug, title, body ?? "");
  return NextResponse.json({ ok: true });
}
