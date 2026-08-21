"use client";
import { useState } from "react";

const items = [
  { title: "İstanbul Bölge — final maçı", type: "FOTO", event: "istanbul-bolge", grad: "from-cyan-deep to-ink" },
  { title: "905A ittifak görüşmesi", type: "FOTO", event: "istanbul-bolge", grad: "from-ink to-cyan-brand" },
  { title: "ADC Ankara uçuş hattı", type: "FOTO", event: "adc-ankara", grad: "from-emerald-600 to-ink" },
  { title: "Sezon açılış filmi (kaba kurgu)", type: "VİDEO", event: "genel", grad: "from-ink to-purple-700" },
  { title: "Hakem brifingi", type: "FOTO", event: "izmir-lig", grad: "from-cyan-brand to-cyan-deep" },
  { title: "Kupa töreni geniş plan", type: "FOTO", event: "istanbul-bolge", grad: "from-amber-500 to-ink" },
  { title: "Pit alanı timelapse", type: "VİDEO", event: "bursa-drone", grad: "from-ink to-alliance-red" },
  { title: "Tanıtım — dikey kesit (Reels)", type: "VİDEO", event: "genel", grad: "from-alliance-blue to-ink" },
];
const filters = ["TÜMÜ", "FOTO", "VİDEO"];

export default function MedyaAdmin() {
  const [f, setF] = useState("TÜMÜ");
  const list = items.filter(i => f === "TÜMÜ" || i.type === f);
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold text-ink">MEDYA KÜTÜPHANESİ</h1>
          <p className="text-[13.5px] text-ink/55">Etkinlik fotoğraf/video arşivi — haber ve sosyal medya üretimi için kaynak havuzu.</p>
        </div>
        <div className="flex gap-2">
          {filters.map(x => (
            <button key={x} onClick={() => setF(x)}
              className={`rounded-md px-3.5 py-2 font-display text-[12px] font-bold ${f === x ? "bg-ink text-cyan-brand" : "border-[1.5px] border-ink/20 text-ink/60"}`}>{x}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border-2 border-dashed border-ink/25 bg-white/70 p-6 text-center">
        <p className="font-display text-[14px] font-bold text-ink/70">Dosyaları buraya sürükle · JPG, PNG, MP4 (maks. 500 MB)</p>
        <p className="mt-1 text-[12px] text-ink/45">Yüklenen görseller otomatik olarak etkinlik etiketiyle arşivlenir. Gerçek kişilerin görselleri için KVKK onam kaydı zorunludur.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map(i => (
          <div key={i.title} className="group overflow-hidden rounded-xl border-2 border-ink bg-white">
            <div className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${i.grad}`}>
              <span className="font-display text-[28px] text-white/80">{i.type === "VİDEO" ? "▶" : "◆"}</span>
              <span className="absolute left-2 top-2 rounded bg-ink px-1.5 py-0.5 font-display text-[9.5px] font-bold text-cyan-brand">{i.type}</span>
            </div>
            <div className="p-3">
              <p className="truncate text-[13px] font-semibold text-ink">{i.title}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-display text-[10.5px] font-bold tracking-[0.5px] text-ink/45">#{i.event}</span>
                <span className="flex gap-2 font-display text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="text-cyan-deep">KOPYALA</button><button className="text-red-600">SİL</button>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
