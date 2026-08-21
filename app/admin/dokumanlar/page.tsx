"use client";
import { useState } from "react";

const initial = [
  { name: "ACH Pinnacle — Oyun Kılavuzu v1.2 (TR)", cat: "Oyun Kılavuzları", size: "4.2 MB", downloads: 1240, updated: "14 Ağu 2026" },
  { name: "ENG Tier Takeover — Kural Kitabı v1.0", cat: "Oyun Kılavuzları", size: "3.1 MB", downloads: 890, updated: "10 Ağu 2026" },
  { name: "ADC Fast Track — Görev Rehberi (TR çeviri)", cat: "Oyun Kılavuzları", size: "2.7 MB", downloads: 512, updated: "08 Ağu 2026" },
  { name: "Robot Denetim Formu 2026-27", cat: "Formlar", size: "180 KB", downloads: 2100, updated: "01 Ağu 2026" },
  { name: "Veli İzin Belgesi Şablonu", cat: "Formlar", size: "120 KB", downloads: 3400, updated: "01 Ağu 2026" },
  { name: "Mühendislik Defteri Değerlendirme Rubriği", cat: "Jüri Belgeleri", size: "640 KB", downloads: 760, updated: "05 Ağu 2026" },
  { name: "Marka Kullanım Kılavuzu (takımlar için)", cat: "Marka", size: "8.9 MB", downloads: 210, updated: "12 Ağu 2026" },
];

export default function DokumanlarAdmin() {
  const [docs, setDocs] = useState(initial);
  const [msg, setMsg] = useState("");
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold text-ink">DOKÜMANLAR</h1>
          <p className="text-[13.5px] text-ink/55">Sitede /dokumanlar altında yayınlanan dosyalar.</p>
        </div>
        <button onClick={() => setMsg("Yükleme penceresi (demo) — dosya seçildiğinde sürüm numarası otomatik artar.")}
          className="plate-hover rounded-md bg-ink px-4 py-2.5 font-display text-[12.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">+ YENİ DOSYA YÜKLE</button>
      </div>
      {msg && <p className="mt-4 rounded-lg border-2 border-cyan-deep bg-cyan-deep/10 px-4 py-2.5 text-[13px] font-semibold text-cyan-deep">{msg}</p>}
      <div className="mt-5 overflow-x-auto rounded-xl border-2 border-ink bg-white">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-ink font-display text-[11px] tracking-[1px] text-white">
            <tr>{["DOSYA", "KATEGORİ", "BOYUT", "İNDİRME", "GÜNCELLEME", ""].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {docs.map((d, i) => (
              <tr key={d.name} className="hover:bg-paper">
                <td className="px-4 py-3 font-semibold text-ink">📄 {d.name}</td>
                <td className="px-4 py-3"><span className="rounded bg-paper px-2 py-0.5 font-display text-[10.5px] font-bold text-ink/60">{d.cat}</span></td>
                <td className="px-4 py-3 text-ink/60">{d.size}</td>
                <td className="px-4 py-3 font-display font-bold text-cyan-deep">{d.downloads.toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3 text-ink/60">{d.updated}</td>
                <td className="px-4 py-3">
                  <span className="flex gap-2">
                    <button className="font-display text-[11.5px] font-bold text-cyan-deep">SÜRÜM +</button>
                    <button onClick={() => { setDocs(ds => ds.filter((_, j) => j !== i)); setMsg(`"${d.name}" yayından kaldırıldı.`); }}
                      className="font-display text-[11.5px] font-bold text-red-600">KALDIR</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
