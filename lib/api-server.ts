import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback = "Sunucu işlemi başarısız oldu.") {
  const errorId = randomUUID();
  console.error(`[API ERROR ${errorId}]`, error);
  const body: Record<string, string> = { error: fallback, errorId };
  if (process.env.NODE_ENV !== "production") {
    const e: any = error;
    if (e?.message) body.detail = String(e.message);
    if (e?.code) body.code = String(e.code);
  }
  return NextResponse.json(body, { status: 500, headers: { "Cache-Control": "no-store" } });
}
