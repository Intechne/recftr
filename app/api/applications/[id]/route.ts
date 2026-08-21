import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { resolveApplication } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if ((await verifySessionToken(req.cookies.get("recf_session")?.value)) !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json();
  if (action !== "approve" && action !== "reject")
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  const app = await resolveApplication(Number(id), action);
  if (!app) return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true, num: app.num, action });
}
