import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback="Sunucu işlemi başarısız oldu.") {
  const e:any=error;
  console.error("[API ERROR]", e);
  const message = e?.message || fallback;
  const code = e?.code ? String(e.code) : undefined;
  return NextResponse.json({ error: message, ...(code?{code}:{} ) }, { status: 500 });
}
