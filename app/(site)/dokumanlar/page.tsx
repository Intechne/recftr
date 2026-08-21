"use client";
import { useState } from "react";
import { docCategories } from "@/lib/data";
import { PageHead } from "@/components/Ui";

export default function DokumanlarPage() {
  const [active, setActive] = useState(0);
  const cat = docCategories[active];
  return (
    <div className="pb-20">
      <PageHead kicker="BİLGİ MERKEZİ" title="DOKÜMANLAR"
        sub="Sezon dokümanları, teknik dokümantasyon, koç kaynakları ve marka kiti — tek yerde." />
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {docCategories.map((c, i) => (
            <button key={c.title} onClick={() => setActive(i)}
              className={`plate-hover rounded-xl border-2 border-ink bg-white p-5 text-left shadow-plateSm transition-colors ${active === i ? "" : "opacity-80"}`}
              style={{ ["--tw-shadow-color" as string]: c.hex, outline: active === i ? `3px solid ${c.hex}` : "none", outlineOffset: 2 }}
              aria-pressed={active === i}>
              <span className="text-[26px]" aria-hidden>{c.icon}</span>
              <h2 className="mt-2 font-display text-[15px] font-bold text-ink">{c.title.toUpperCase()}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/55">{c.desc}</p>
              <p className="mt-2.5 font-display text-[12px] font-semibold" style={{ color: c.hex === "#29B9E5" || c.hex === "#8DC63F" ? "#10192F" : c.hex }}>
                {c.count.toUpperCase()} →
              </p>
            </button>
          ))}
        </div>

        <h2 className="mt-12 font-display text-[22px] font-bold text-ink">{cat.icon} {cat.title.toUpperCase()} 2026–27</h2>
        <div className="mt-4 space-y-3.5">
          {cat.docs.map((d) => {
            const light = d.color === "#29B9E5" || d.color === "#8DC63F";
            return (
              <div key={d.name} className="flex flex-wrap items-center gap-4 rounded-lg border-[1.5px] border-ink/20 bg-white px-5 py-4">
                <span className="flex h-10 w-14 items-center justify-center rounded font-display text-[12px] font-bold"
                  style={{ backgroundColor: d.color, color: light ? "#10192F" : "#fff" }}>{d.type}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{d.name}</span>
                  <span className="block text-[12.5px] text-ink/50">{d.ver}</span>
                </span>
                <span className="hidden rounded bg-paper px-2.5 py-1 font-display text-[11px] font-medium text-ink/60 sm:block">{d.lang}</span>
                <span className="hidden rounded bg-paper px-2.5 py-1 font-display text-[11px] font-medium text-ink/60 sm:block">{d.size}</span>
                <button className="rounded-md bg-ink px-4 py-2.5 font-display text-[12px] font-bold text-white transition-colors hover:bg-cyan-deep">İNDİR ↓</button>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[13px] text-ink/45">
          Kılavuzların İngilizce asılları RECF resmi kaynaklarında yayınlanır; Türkçe çeviriler RECF Türkiye tarafından sağlanır. Sürüm farkında İngilizce asıl geçerlidir.
        </p>
      </div>
    </div>
  );
}
