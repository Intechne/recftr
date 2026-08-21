"use client";
import { useEffect, useState } from "react";

type P = { id: number; ref: string; item: string; date_label: string; amount_label: string; status: string };

export default function OdemelerPage() {
  const [pays, setPays] = useState<P[] | null>(null);
  useEffect(() => { fetch("/api/team").then(r => r.ok ? r.json() : null).then(d => d && setPays(d.payments)); }, []);
  const sum = (f: (p: P) => boolean) =>
    pays?.filter(f).reduce((a, p) => a + (parseInt(p.amount_label.replace(/[^\d-−]/g, "").replace("−", "-")) || 0), 0) ?? 0;
  const fmt = (n: number) => "₺" + Math.abs(n).toLocaleString("tr-TR");

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[26px] font-bold text-ink">ÖDEMELER</h1>
      <p className="mt-1 text-[14.5px] text-ink/60">Sezon ödemeleri ve faturalar — canlı kayıt.</p>
      {!pays && <p className="mt-8 font-display text-[14px] font-semibold text-ink/40">Yükleniyor…</p>}
      {pays && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[["ÖDENEN TOPLAM", fmt(sum(p => p.status === "ÖDENDİ")), "lisans + kit + etkinlik"],
              ["İNDİRİM", fmt(sum(p => p.status === "UYGULANDI")), "erken kayıt"],
              ["BEKLEYEN", fmt(sum(p => p.status === "BEKLİYOR")), "yaklaşan etkinlikler"]].map(([t, v, d]) => (
              <div key={t} className="rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand">
                <p className="font-display text-[11px] font-semibold tracking-[1.5px] text-ink/50">{t}</p>
                <p className="mt-1 font-display text-[30px] font-bold text-ink">{v}</p>
                <p className="text-[12px] text-ink/45">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto rounded-xl border-2 border-ink bg-white">
            <table className="w-full min-w-[640px] text-left text-[13.5px]">
              <thead className="bg-ink font-display text-[11.5px] tracking-[1px] text-white">
                <tr>{["FATURA NO", "KALEM", "TARİH", "TUTAR", "DURUM"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {pays.map(p => (
                  <tr key={p.id} className="hover:bg-paper">
                    <td className="px-4 py-3.5 font-display text-[12.5px] font-bold text-ink/70">{p.ref}</td>
                    <td className="px-4 py-3.5 font-semibold text-ink">{p.item}</td>
                    <td className="px-4 py-3.5 text-ink/60">{p.date_label}</td>
                    <td className={`px-4 py-3.5 font-display font-bold ${p.amount_label.startsWith("−") ? "text-emerald-700" : "text-ink"}`}>{p.amount_label}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-md border px-2 py-0.5 font-display text-[10.5px] font-bold ${
                        p.status === "BEKLİYOR" ? "border-amber-600 bg-amber-100 text-amber-800" : "border-emerald-600 bg-emerald-100 text-emerald-800"}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12.5px] text-ink/50">Kurumsal fatura için: <span className="font-semibold text-ink/70">finans@recfturkiye.org</span> · Dekontları Belgeler sayfasından yükleyin.</p>
        </>
      )}
    </div>
  );
}
