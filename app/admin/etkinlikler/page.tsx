"use client";
import { useState } from "react";

const rows = [
  { name: "İstanbul Bölge Turnuvası", meta: "ACH · 14 Eki", pub: "YAYINDA", cap: "54/64", reg: "Kayıt: AÇIK", hex: "#8DC63F" },
  { name: "ADC Ankara Sezon Açılışı", meta: "ADC · 9 Kas", pub: "YAYINDA", cap: "32/32", reg: "Kayıt: DOLU", hex: "#8DC63F" },
  { name: "Bursa İl Etkinliği", meta: "ENG · 26 Eki", pub: "YAYINDA", cap: "31/48", reg: "Kayıt: AÇIK", hex: "#8DC63F" },
  { name: "İzmir Festivali", meta: "ENG · 21 Kas", pub: "YAYINDA", cap: "20/48", reg: "Kayıt: AÇIK", hex: "#8DC63F" },
  { name: "Ege Bölge Şampiyonası", meta: "INS · 12 Ara", pub: "TASLAK", cap: "—", reg: "Yayınlanmadı", hex: "#b38a1a" },
  { name: "Kış Kupası", meta: "PRO · 23 Oca", pub: "TASLAK", cap: "—", reg: "Yayınlanmadı", hex: "#b38a1a" },
];

export default function AdminEtkinlikler() {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Etkinlik ara…"
          className="w-72 rounded-md border-[1.5px] border-ink/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-cyan-deep" />
        <button className="rounded-md bg-cyan-brand px-4.5 px-4 py-2.5 font-display text-[13px] font-bold text-ink">+ YENİ ETKİNLİK</button>
      </div>
      <div className="mt-5 space-y-3">
        {list.map((r) => (
          <div key={r.name} className="flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] border-ink/20 bg-white px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-bold text-ink">{r.name}</p>
              <p className="mt-0.5 text-[13px] text-ink/55">{r.meta} &nbsp;·&nbsp; Kapasite: {r.cap} &nbsp;·&nbsp; {r.reg}</p>
            </div>
            <span className="rounded-md border-[1.5px] px-3.5 py-1.5 font-display text-[11px] font-bold text-ink"
              style={{ borderColor: r.hex, backgroundColor: `${r.hex}22` }}>{r.pub}</span>
            <span className="font-display text-[11px] font-semibold text-cyan-deep">DÜZENLE · TAKIMLAR · KOPYALA</span>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-lg bg-white px-4.5 px-4 py-3.5 text-[12.5px] leading-relaxed text-ink/55">
        Etkinlik düzenleyicisi alanları: ad, program, tarih/saat, konum + harita, kapasite, kayıt aralığı, ücret,
        kitapçık PDF, program akışı satırları, &quot;Etkinlik Hakkında&quot; zengin metin, seyirci/basın bilgileri, kapak görseli.
      </p>
    </div>
  );
}
