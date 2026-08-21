"use client";
import { useState } from "react";
import { tickerItems } from "@/lib/data";

export default function SiteAyarlariAdmin() {
  const [ticker, setTicker] = useState<string[]>([...tickerItems]);
  const [newItem, setNewItem] = useState("");
  const [saved, setSaved] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-deep";
  const label = "block font-display text-[11px] font-semibold tracking-[1px] text-ink/60";

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[24px] font-bold text-ink">SİTE AYARLARI</h1>
      <p className="text-[13.5px] text-ink/55">Genel yapılandırma — duyuru şeridi, iletişim ve yayın durumu.</p>

      <form onSubmit={e => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="mt-6 space-y-6">
        <section className="rounded-xl border-2 border-ink bg-white p-6">
          <p className="font-display text-[14px] font-bold text-ink">GENEL</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={label}>SİTE BAŞLIĞI<input defaultValue="RECF Türkiye — Maç Günü. Her Gün." className={input} /></label>
            <label className={label}>SEZON ETİKETİ<input defaultValue="2026–27" className={input} /></label>
            <label className={label}>İLETİŞİM (TAKIMLAR)<input defaultValue="takim@recfturkiye.org" className={input} /></label>
            <label className={label}>İLETİŞİM (KURUMSAL)<input defaultValue="info@recfturkiye.org" className={input} /></label>
            <label className={label}>INSTAGRAM<input defaultValue="instagram.com/recfturkiye" className={input} /></label>
            <label className={label}>YOUTUBE<input defaultValue="youtube.com/@recfturkiye" className={input} /></label>
          </div>
        </section>

        <section className="rounded-xl border-2 border-ink bg-white p-6">
          <p className="font-display text-[14px] font-bold text-ink">DUYURU ŞERİDİ (TICKER)</p>
          <p className="mt-1 text-[12.5px] text-ink/50">Ana sayfanın üstünde kayan bant — sıralı yayınlanır.</p>
          <div className="mt-4 space-y-2">
            {ticker.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 font-display text-[12px] font-bold text-ink/40">{i + 1}.</span>
                <input value={t} onChange={e => setTicker(ts => ts.map((x, j) => j === i ? e.target.value : x))}
                  className="flex-1 rounded-md border-[1.5px] border-ink/15 bg-paper px-3 py-2 text-[13px] outline-none focus:border-cyan-deep" />
                <button type="button" onClick={() => setTicker(ts => ts.filter((_, j) => j !== i))}
                  className="rounded-md border-[1.5px] border-red-300 px-2.5 py-2 font-display text-[11px] font-bold text-red-600">SİL</button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Yeni şerit maddesi…"
              className="flex-1 rounded-md border-[1.5px] border-ink/20 px-3 py-2 text-[13px] outline-none focus:border-cyan-deep" />
            <button type="button" onClick={() => { if (newItem.trim()) { setTicker(ts => [...ts, newItem.trim()]); setNewItem(""); } }}
              className="rounded-md bg-cyan-brand px-4 py-2 font-display text-[12px] font-bold text-ink">EKLE</button>
          </div>
        </section>

        <section className="rounded-xl border-2 border-ink bg-white p-6">
          <p className="font-display text-[14px] font-bold text-ink">YAYIN DURUMU</p>
          <label className="mt-3 flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} className="h-5 w-5 accent-cyan-deep" />
            <span className="text-[13.5px] font-semibold text-ink">Bakım modu — site ziyaretçilere "yakında" ekranı gösterir (portal/CMS açık kalır)</span>
          </label>
          {maintenance && <p className="mt-3 rounded-lg border-2 border-amber-500 bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-800">⚠ Bakım modu şu an sadece önizleme — canlıya almak için Kaydet.</p>}
        </section>

        <div className="flex items-center gap-4">
          <button className="plate-hover rounded-md bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">KAYDET</button>
          {saved && <span className="font-display text-[13px] font-bold text-emerald-700">✓ Ayarlar kaydedildi (demo)</span>}
        </div>
      </form>
    </div>
  );
}
