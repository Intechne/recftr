import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { createApplication, listApplications } from "@/lib/db";
import { calculateRegistrationTotal, REGISTRATION_FEES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if ((await verifySessionToken(req.cookies.get("recf_session")?.value)) !== "admin")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(await listApplications());
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  for (const f of ["num", "team", "org", "city", "type", "program", "mentor", "email", "phone"])
    if (!b[f] || typeof b[f] !== "string" || !b[f].trim())
      return NextResponse.json({ error: `Eksik alan: ${f}` }, { status: 400 });
  if (!/^[A-Z0-9-]{2,8}$/.test(b.num))
    return NextResponse.json({ error: "Takım numarası 2–8 karakter, harf/rakam olmalı." }, { status: 400 });
  if (!b.email.includes("@"))
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  if (!(b.program in REGISTRATION_FEES))
    return NextResponse.json({ error: "Geçersiz program." }, { status: 400 });
  const kit = !!b.kit;
  const total = calculateRegistrationTotal(b.program, kit);
  if (total === null) return NextResponse.json({ error: "Ücret hesaplanamadı." }, { status: 400 });
  const { id } = await createApplication({
    num: b.num.trim(), team: b.team.trim(), org: b.org.trim(), city: b.city.trim(), type: b.type.trim(),
    program: b.program, mentor: b.mentor.trim(), email: b.email.trim(), phone: b.phone.trim(), kit, total
  });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
