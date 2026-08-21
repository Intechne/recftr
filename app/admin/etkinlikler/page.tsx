"use client";
import { useEffect, useState } from "react";

type Ev = { slug: string; code: string; title: string; city: string; venue: string; date_label: string; capacity: number; registered: number; status: string; excerpt: string; published: boolean | number };
const EMPTY: Ev = { slug: "", code: "ACH", title: "", city: "", venue: "", date_label: "", capacity: 64, registered: 0, status: "KAYIT AÇIK", excerpt: "", published: true };

export default function EtkinliklerAdmin() {
  const [list, setList] = useState<Ev[] | null>(null);
  const [form, setForm] = useState<Ev>(EMPTY);
  const [msg, setMsg] = useState("");
  const load = () => fetch("/api/events?all=1").then(r => r.json()).then(setList);
  useEffect(() => { load(); }, []);
  const set = (k: keyof Ev, v: any) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setMsg("");
    const r = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await r.json();
    if (!r.ok) { setMsg("⚠ " + (j.error ?? "Kaydedilemedi")); return; }
    setMsg(`✓ "${form.title}" kaydedildi — sitede ${form.published ? "yayında" : "taslak"}.`);
    setForm(EMPTY); load();
  };
  const del = async (slug: string) => {
    await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
    setMsg(`"${slug}" silindi.`); load();
  };
  const toggle = async (e: Ev) => {
    await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...e, published: !e.published }) });
    load();
  };
  const input = "w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3 py-2 text-[13px] outline-none focus:border-cyan-deep";
  const lbl = "block font-display text-[10.5px] font-semibold tracking-[1px] text-ink/55";

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-[24px] font-bold text-ink">ETKİNLİKLER</h1>
      <p className="text-[13.5px] text-ink/55">Buradaki kayıtlar sitenin /etkinlikler sayfasını doğrudan besler.</p>
      {msg && <p className="mt-4 rounded-lg border-2 border-cyan-deep bg-cyan-deep/10 px-4 py-2.5 text-[13px] font-semibold text-cyan-deep">{msg}</p>}

      <div className="mt-5 rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand">
        <p className="font-display text-[13.5px] font-bold text-ink">{form.slug && list?.some(e => e.slug === form.slug) ? "ETKİNLİĞİ DÜZENLE" : "YENİ ETKİNLİK"}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className={lbl}>BAŞLIK *<input value={form.title} onChange={e => { set("title", e.target.value); if (!list?.some(x => x.slug === form.slug)) set("slug", e.target.value.toLowerCase().replace(/[ğ]/g,"g").replace(/[ü]/g,"u").replace(/[ş]/g,"s").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ç]/g,"c").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,48)); }} className={input} placeholder="İstanbul Bölge Turnuvası" /></label>
          <label className={lbl}>SLUG *<input value={form.slug} onChange={e => set("slug", e.target.value)} className={input} placeholder="istanbul-bolge" /></label>
          <label className={lbl}>PROGRAM *<select value={form.code} onChange={e => set("code", e.target.value)} className={input}>{["ENG","ACH","INS","ADC","PRO","TÜMÜ"].map(c => <option key={c}>{c}</option>)}</select></label>
          <label className={lbl}>ŞEHİR *<input value={form.city} onChange={e => set("city", e.target.value)} className={input} placeholder="İstanbul" /></label>
          <label className={lbl}>MEKAN<input value={form.venue} onChange={e => set("venue", e.target.value)} className={input} placeholder="Teknopark İstanbul" /></label>
          <label className={lbl}>TARİH ETİKETİ *<input value={form.date_label} onChange={e => set("date_label", e.target.value)} className={input} placeholder="14 Ekim 2026" /></label>
          <label className={lbl}>KAPASİTE<input type="number" value={form.capacity} onChange={e => set("capacity", Number(e.target.value))} className={input} /></label>
          <label className={lbl}>KAYITLI<input type="number" value={form.registered} onChange={e => set("registered", Number(e.target.value))} className={input} /></label>
          <label className={lbl}>DURUM<select value={form.status} onChange={e => set("status", e.target.value)} className={input}>{["KAYIT AÇIK","SON KONTENJANLAR","DOLU","YAKINDA","TAMAMLANDI"].map(c => <option key={c}>{c}</option>)}</select></label>
          <label className={lbl + " sm:col-span-3"}>ÖZET<input value={form.excerpt} onChange={e => set("excerpt", e.target.value)} className={input} placeholder="Kart üzerinde görünen tek cümle" /></label>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button onClick={save} className="plate-hover rounded-md bg-ink px-5 py-2.5 font-display text-[12.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">KAYDET</button>
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink"><input type="checkbox" checked={!!form.published} onChange={e => set("published", e.target.checked)} className="h-4 w-4 accent-cyan-deep" />Sitede yayınla</label>
          {form.slug && <button onClick={() => setForm(EMPTY)} className="text-[12px] font-bold text-ink/50">TEMİZLE</button>}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border-2 border-ink bg-white">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="bg-ink font-display text-[11px] tracking-[1px] text-white">
            <tr>{["ETKİNLİK","PROGRAM","TARİH","DOLULUK","DURUM","YAYIN",""].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {list?.map(e => (
              <tr key={e.slug} className="hover:bg-paper">
                <td className="px-4 py-3"><p className="font-semibold text-ink">{e.title}</p><p className="text-[11.5px] text-ink/45">{e.city}{e.venue ? " · " + e.venue : ""} · /{e.slug}</p></td>
                <td className="px-4 py-3"><span className="rounded bg-paper px-2 py-0.5 font-display text-[10.5px] font-bold text-ink/60">{e.code}</span></td>
                <td className="px-4 py-3 text-ink/60">{e.date_label}</td>
                <td className="px-4 py-3 font-display font-bold text-cyan-deep">{e.registered}/{e.capacity}</td>
                <td className="px-4 py-3 text-[11.5px] font-semibold text-ink/60">{e.status}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(e)} className={`rounded-md px-2.5 py-1 font-display text-[10.5px] font-bold ${e.published ? "bg-emerald-100 text-emerald-800 border border-emerald-600" : "bg-paper text-ink/50 border border-ink/25"}`}>{e.published ? "YAYINDA" : "TASLAK"}</button>
                </td>
                <td className="px-4 py-3"><span className="flex gap-2 font-display text-[11.5px] font-bold">
                  <button onClick={() => setForm({ ...e, published: !!e.published })} className="text-cyan-deep">DÜZENLE</button>
                  <button onClick={() => del(e.slug)} className="text-red-600">SİL</button>
                </span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
