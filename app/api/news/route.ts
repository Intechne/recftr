import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { publishNews, listPublishedNews } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listPublishedNews());
}
export async function POST(req: NextRequest) {
  if ((await verifySessionToken(req.cookies.get("recf_session")?.value)) !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json();
  if (!b.title?.trim() || !b.slug?.trim())
    return NextResponse.json({ error: "Başlık gerekli." }, { status: 400 });
  await publishNews({
    slug: b.slug, tag: b.tag ?? "DUYURU", title: b.title,
    excerpt: b.excerpt ?? "", body: b.body ?? "", published: !!b.published,
  });
  return NextResponse.json({ ok: true, slug: b.slug }, { status: 201 });
}
