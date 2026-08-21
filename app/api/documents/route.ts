import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { addDocument, deleteDocument, listDocuments } from "@/lib/db";
export const dynamic = "force-dynamic";
const isAdmin = async (r: NextRequest) => (await verifySessionToken(r.cookies.get("recf_session")?.value)) === "admin";

export async function GET() { return NextResponse.json(await listDocuments()); }
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const b = await req.json();
  if (!b.name?.trim() || !b.cat?.trim()) return NextResponse.json({ error: "Ad ve kategori zorunlu." }, { status: 400 });
  await addDocument(b);
  return NextResponse.json({ ok: true }, { status: 201 });
}
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await req.json();
  await deleteDocument(Number(id));
  return NextResponse.json({ ok: true });
}
