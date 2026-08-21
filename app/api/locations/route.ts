import { NextRequest, NextResponse } from "next/server";
import { districtsForProvince, provinces } from "@/lib/locations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const province = String(req.nextUrl.searchParams.get("province") || "").trim();
    if (!province) return NextResponse.json({ provinces: provinces() });
    const districts = districtsForProvince(province);
    if (!districts.length) return NextResponse.json({ districts: [] }, { status: 404 });
    return NextResponse.json({ province, districts });
  } catch (e: any) {
    return NextResponse.json(
      { error: "İl/ilçe listesi yüklenemedi.", detail: String(e?.message || "") },
      { status: 500 },
    );
  }
}
