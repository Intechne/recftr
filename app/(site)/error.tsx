"use client";

import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[SITE ERROR]", error); }, [error]);
  return <div className="mx-auto max-w-3xl px-5 py-24 text-center">
    <p className="font-display text-xs font-bold tracking-widest text-cyan-deep">RECF TÜRKİYE</p>
    <h1 className="mt-3 font-display text-3xl font-bold text-ink">Sayfa yüklenirken bir sorun oluştu.</h1>
    <p className="mt-3 text-sm text-ink/55">İçerik servisi geçici olarak yanıt vermiyor olabilir. Sayfayı yeniden deneyebilirsiniz.</p>
    <button onClick={reset} className="mt-6 rounded bg-ink px-5 py-3 font-display text-xs font-bold text-white">YENİDEN DENE</button>
  </div>;
}
