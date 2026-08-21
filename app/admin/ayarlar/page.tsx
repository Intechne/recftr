"use client";
import { useEffect, useState } from "react";

export default function SiteAyarlariAdmin() {
  const [ticker, setTicker] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [contactTeam, setContactTeam] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(s => {
      try { setTicker(JSON.parse(s.ticker ?? "[]")); } catch { setTicker([]); }
      setContactTeam(s.contact_team ?? ""); setContactInfo(s.contact_info ?? "");
      setMaintenance(s.maintenance === "1");
    });
  }, []);

  const save = async () => {
    const r = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: JSON.stringify(ticker), contact_team: contactTeam, contact_info: contactInfo, maintenance: maintenance ? "1" : "0" }) });
    setMsg(r.ok ? "✓ Kaydedildi — duyuru şeridi sitede anında güncellendi." : "⚠ Kaydedilemedi.");
  };
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-deep";
  const lbl = "block font-display text-[11px] font-semibold tracking-[1px] text-ink/60";

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[24px] font-bold text-ink">SİTE AYARLARI</h1>
      <p className="text-[13.5px] text-ink/55">Bu değerler veritabanında tutulur; site bileşenleri canlı okur.</p>
      {msg && <p className="mt-4 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700">{msg}</p>}

      <section className="mt-5 rounded-xl border-2 border-ink bg-white p-6">
        <p className="font-display text-[14px] font-bold text-ink">DUYURU ŞERİDİ (TICKER)</p>
        <div className="mt-4 space-y-2">
          {ticker.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 font-display text-[12px] font-bold text-ink/40">{i + 1}.</span>
              <input value={t} onChange={e => setTicker(ts => ts.map((x, j) => j === i ? e.target.value : x))}
                className="flex-1 rounded-md border-[1.5px] border-ink/15 bg-paper px-3 py-2 text-[13px] outline-none focus:border-cyan-deep" />
              <button onClick={() => setTicker(ts => ts.filter((_, j) => j !== i))}
                className="rounded-md border-[1.5px] border-red-300 px-2.5 py-2 font-display text-[11px] font-bold text-red-600">SİL</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Yeni şerit maddesi…"
            className="flex-1 rounded-md border-[1.5px] border-ink/20 px-3 py-2 text-[13px] outline-none focus:border-cyan-deep" />
          <button onClick={() => { if (newItem.trim()) { setTicker(ts => [...ts, newItem.trim()]); setNewItem(""); } }}
            className="rounded-md bg-cyan-brand px-4 py-2 font-display text-[12px] font-bold text-ink">EKLE</button>
        </div>
      </section>

      <section className="mt-5 rounded-xl border-2 border-ink bg-white p-6">
        <p className="font-display text-[14px] font-bold text-ink">İLETİŞİM</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className={lbl}>TAKIM İLETİŞİM<input value={contactTeam} onChange={e => setContactTeam(e.target.value)} className={input} /></label>
          <label className={lbl}>KURUMSAL İLETİŞİM<input value={contactInfo} onChange={e => setContactInfo(e.target.value)} className={input} /></label>
        </div>
      </section>

      <section className="mt-5 rounded-xl border-2 border-ink bg-white p-6">
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} className="h-5 w-5 accent-cyan-deep" />
          <span className="text-[13.5px] font-semibold text-ink">Bakım modu işareti (yayın planlaması için not — siteyi kapatmaz)</span>
        </label>
      </section>

      <button onClick={save} className="plate-hover mt-6 rounded-md bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">KAYDET</button>
    </div>
  );
}
