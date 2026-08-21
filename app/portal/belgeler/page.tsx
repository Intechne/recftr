"use client";
import { useState } from "react";

type Doc = { name: string; desc: string; status: "ONAYLI" | "İNCELEMEDE" | "EKSİK"; date?: string; required: boolean };

const initial: Doc[] = [
  { name: "Robot Denetim Formu", desc: "İstanbul Bölge öncesi zorunlu — PDF imzalı", status: "ONAYLI", date: "12 Ağu 2026", required: true },
  { name: "Veli İzin Belgeleri (6 üye)", desc: "18 yaş altı tüm üyeler için", status: "İNCELEMEDE", date: "18 Ağu 2026", required: true },
  { name: "Mühendislik Defteri (PDF)", desc: "Jüri ön değerlendirmesi için dijital kopya", status: "EKSİK", required: true },
  { name: "Okul Resmî Yazısı", desc: "Kurum onaylı katılım yazısı", status: "ONAYLI", date: "02 Ağu 2026", required: true },
  { name: "Takım Logosu (SVG/PNG)", desc: "Yayın grafikleri ve sonuç ekranları için", status: "EKSİK", required: false },
  { name: "Sağlık Bilgi Formları", desc: "Etkinlik günü acil durum iletişimi", status: "İNCELEMEDE", date: "19 Ağu 2026", required: false },
];

const badge = {
  "ONAYLI": "bg-emerald-100 text-emerald-800 border-emerald-600",
  "İNCELEMEDE": "bg-amber-100 text-amber-800 border-amber-600",
  "EKSİK": "bg-red-100 text-red-700 border-red-600",
};

export default function BelgelerPage() {
  const [docs, setDocs] = useState(initial);
  const [note, setNote] = useState("");
  const done = docs.filter(d => d.status === "ONAYLI").length;

  const upload = (i: number) => {
    setDocs(ds => ds.map((d, j) => j === i ? { ...d, status: "İNCELEMEDE", date: "bugün" } : d));
    setNote(`"${docs[i].name}" yüklendi — ekip incelemesine alındı. (Demo: dosya saklanmaz)`);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[26px] font-bold text-ink">BELGELER</h1>
      <p className="mt-1 text-[14.5px] text-ink/60">Sezon ve etkinlik katılımı için gereken evrak durumu.</p>

      <div className="mt-6 rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand">
        <div className="flex items-center justify-between">
          <p className="font-display text-[14px] font-bold text-ink">TAMAMLANMA</p>
          <p className="font-display text-[14px] font-bold text-cyan-deep">{done}/{docs.length} belge onaylı</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-cyan-brand transition-all" style={{ width: `${(done / docs.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-[12.5px] text-ink/50">Zorunlu belgeler tamamlanmadan etkinlik check-in QR kodu üretilmez.</p>
      </div>

      {note && <p className="mt-4 rounded-lg border-2 border-cyan-deep bg-cyan-deep/10 px-4 py-3 text-[13.5px] font-semibold text-cyan-deep">{note}</p>}

      <div className="mt-5 space-y-3">
        {docs.map((d, i) => (
          <div key={d.name} className="flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] border-ink/15 bg-white p-4">
            <span className="font-display text-[20px]">📄</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-bold text-ink">
                {d.name} {d.required && <span className="ml-1 rounded bg-ink px-1.5 py-0.5 align-middle font-display text-[9.5px] font-bold tracking-[1px] text-cyan-brand">ZORUNLU</span>}
              </p>
              <p className="text-[13px] text-ink/55">{d.desc}{d.date ? ` · Son yükleme: ${d.date}` : ""}</p>
            </div>
            <span className={`rounded-md border px-2.5 py-1 font-display text-[11px] font-bold ${badge[d.status]}`}>{d.status}</span>
            {d.status !== "ONAYLI" && (
              <button onClick={() => upload(i)} className="plate-hover rounded-md bg-ink px-3.5 py-2 font-display text-[12px] font-bold text-white shadow-plateSm shadow-cyan-brand">
                {d.status === "EKSİK" ? "YÜKLE ↑" : "YENİDEN YÜKLE"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-ink/25 bg-white/60 p-8 text-center">
        <p className="font-display text-[15px] font-bold text-ink/70">Dosyaları buraya sürükle ya da tıklayıp seç</p>
        <p className="mt-1 text-[12.5px] text-ink/45">PDF, JPG, PNG · maks. 20 MB · Yüklemeler mentor onayıyla ekibe iletilir</p>
      </div>
    </div>
  );
}
