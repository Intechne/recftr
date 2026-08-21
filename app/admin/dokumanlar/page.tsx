"use client";
import { useEffect, useState } from "react";

type D = { id: number; name: string; cat: string; size_label: string; url: string; downloads: number; updated_label: string };

export default function DokumanlarAdmin() {
  const [docs, setDocs] = useState<D[] | null>(null);
  const [form, setForm] = useState({ name: "", cat: "Oyun Kılavuzları", size_label: "", url: "" });
  const [msg, setMsg] = useState("");
  const load = () => fetch("/api/documents").then(r => r.json()).then(setDocs);
  useEffect(() => { load(); }, []);

  const add = async () => {
    setMsg("");
    const r = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, updated_label: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) }) });
    if (!r.ok) { setMsg("⚠ " + ((await r.json()).error ?? "Eklenemedi")); return; }
    setMsg(`✓ "${form.name}" yayınlandı — /dokumanlar sayfasında canlı.`);
    setForm({ name: "", cat: form.cat, size_label: "", url: "" }); load();
  };
  const del = async (d: D) => {
    await fetch("/api/documents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id }) });
    setMsg(`"${d.name}" kaldırıldı.`); load();
  };
  const input = "w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3 py-2 text-[13px] outline-none focus:border-cyan-deep";
  const lbl = "block font-display text-[10.5px] font-semibold tracking-[1px] text-ink/55";

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-[24px] font-bold text-ink">DOKÜMANLAR</h1>
      <p className="text-[13.5px] text-ink/55">Sitenin /dokumanlar sayfası bu listeden beslenir. Dosyayı Supabase Storage/Drive'a yükleyip bağlantısını buraya ekleyin.</p>
      {msg && <p className="mt-4 rounded-lg border-2 border-cyan-deep bg-cyan-deep/10 px-4 py-2.5 text-[13px] font-semibold text-cyan-deep">{msg}</p>}
      <div className="mt-5 rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand">
        <div className="grid gap-3 sm:grid-cols-4">
          <label className={lbl + " sm:col-span-2"}>DOSYA ADI *<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={input} placeholder="ACH Oyun Kılavuzu v1.3 (TR)" /></label>
          <label className={lbl}>KATEGORİ<select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))} className={input}>{["Oyun Kılavuzları","Formlar","Jüri Belgeleri","Marka","Diğer"].map(c => <option key={c}>{c}</option>)}</select></label>
          <label className={lbl}>BOYUT<input value={form.size_label} onChange={e => setForm(f => ({ ...f, size_label: e.target.value }))} className={input} placeholder="3.2 MB" /></label>
          <label className={lbl + " sm:col-span-3"}>DOSYA BAĞLANTISI (URL)<input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={input} placeholder="https://…/dosya.pdf" /></label>
          <button onClick={add} className="plate-hover self-end rounded-md bg-ink px-4 py-2.5 font-display text-[12.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">+ YAYINLA</button>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border-2 border-ink bg-white">
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead className="bg-ink font-display text-[11px] tracking-[1px] text-white">
            <tr>{["DOSYA","KATEGORİ","BOYUT","İNDİRME","GÜNCELLEME",""].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {docs?.map(d => (
              <tr key={d.id} className="hover:bg-paper">
                <td className="px-4 py-3 font-semibold text-ink">📄 {d.name}</td>
                <td className="px-4 py-3"><span className="rounded bg-paper px-2 py-0.5 font-display text-[10.5px] font-bold text-ink/60">{d.cat}</span></td>
                <td className="px-4 py-3 text-ink/60">{d.size_label}</td>
                <td className="px-4 py-3 font-display font-bold text-cyan-deep">{d.downloads.toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3 text-ink/60">{d.updated_label}</td>
                <td className="px-4 py-3"><button onClick={() => del(d)} className="font-display text-[11.5px] font-bold text-red-600">KALDIR</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
