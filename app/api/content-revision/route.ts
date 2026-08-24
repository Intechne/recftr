import { NextResponse } from "next/server";
import { currentContentRevision } from "@/lib/content-consistency";
import { apiError } from "@/lib/api-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const revision = await currentContentRevision();
    return NextResponse.json({ revision }, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    return apiError(error, "İçerik sürümü alınamadı.");
  }
}
