import { NextRequest, NextResponse } from "next/server";
import { portalSession } from "@/lib/auth";
import { audit, getTeam, listPayments, listTeamDocs, updateTeam } from "@/lib/db";
import { IMAGE_MIME, PUBLIC_BUCKET, pathFromPublicUrl, safeStoragePath, verifyStoredObject } from "@/lib/storage";
import { cleanText, validEmail } from "@/lib/security";
import { apiError } from "@/lib/api-server";
import { publishContentChange } from "@/lib/content-consistency";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await portalSession(req);
    if (!session?.teamNum) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const team = await getTeam(session.teamNum);
    if (!team) return NextResponse.json({ error: "Takım bulunamadı" }, { status: 404 });
    return NextResponse.json({ num: session.teamNum, profile: team, docs: await listTeamDocs(session.teamNum), payments: await listPayments(session.teamNum) });
  } catch (error) { return apiError(error, "Takım bilgileri alınamadı."); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await portalSession(req);
    if (!session?.teamNum) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const current = await getTeam(session.teamNum);
    if (!current) return NextResponse.json({ error: "Takım yok" }, { status: 404 });
    const body = await req.json();
    const email = cleanText(body.mentor_email ?? current.mentor_email, 254).toLowerCase();
    if (email && !validEmail(email)) return NextResponse.json({ error: "Mentor e-posta adresi geçersiz." }, { status: 400 });
    const logo = cleanText(body.logo_url ?? current.logo_url, 1000);
    if (logo !== current.logo_url) {
      const path = pathFromPublicUrl(logo);
      if (!path || !safeStoragePath(path, `teams/${session.teamNum}/logo`)) return NextResponse.json({ error: "Takım logosu yalnızca kendi takım Storage alanınızdan seçilebilir." }, { status: 400 });
      const verified = await verifyStoredObject(PUBLIC_BUCKET, path, IMAGE_MIME, 5 * 1024 * 1024);
      if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });
    }
    const allowed = {
      ...current,
      name: cleanText(body.name ?? current.name, 120),
      school: cleanText(body.school ?? current.school, 160),
      city: cleanText(body.city ?? current.city, 80),
      district: cleanText(body.district ?? current.district, 80),
      program: current.program, status: current.status, visible: current.visible,
      mentor_name: cleanText(body.mentor_name ?? current.mentor_name, 120),
      mentor_email: email,
      phone: cleanText(body.phone ?? current.phone, 40),
      slogan: cleanText(body.slogan ?? current.slogan, 300),
      logo_url: logo,
    };
    const updated = await updateTeam(session.teamNum, allowed);
    await audit(session.email, "portal_update", "team", session.teamNum, { name: updated?.name });
    await publishContentChange(["/takimlar"]);
    return NextResponse.json(updated);
  } catch (error) { return apiError(error, "Takım profili güncellenemedi."); }
}
