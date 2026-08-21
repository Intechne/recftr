"use client";
import { useEffect, useState } from "react";

export default function SayfalarAdmin() {
  const [slug, setSlug] = useState("kvkk");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [updated, setUpdated] = useState("");

  const load = async (s: string) => {
    setMsg("");
    const r = await fetch(`/api/pages/${s}`);
    if (r.ok) { const p = await r.json(); setTitle(p.title); setBody(p.body); setUpdated(p.updated); }
    else { setTitle(""); setBody(""); setUpdated(""); }
  };
  useEffect(() => { load(slug); }, [slug]);

  const save = async () => {
    const r = await fetch(`/api/pages/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, body }) });
    setMsg(r.ok ? `✓ Yayınlandı — sitede /${slug} adresinde canlı.` : "⚠ Kaydedilemedi.");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[24px] font-bold text-ink">SAYFALAR</h1>
      <p className="text-[13.5px] text-ink/55">KVKK, gizlilik ve diğer statik metinler — buradan yayınlanır, sitede anında güncellenir.</p>
      <div className="mt-5 flex gap-2">
        {[["kvkk","KVKK"],["gizlilik","GİZLİLİK"]].map(([s2, l]) => (
          <button key={s2} onClick={() => setSlug(s2)}
            className={`rounded-md px-4 py-2 font-display text-[12.5px] font-bold ${slug === s2 ? "bg-ink text-cyan-brand" : "border-[1.5px] border-ink/20 text-ink/60"}`}>{l}</button>
        ))}
        <a href={`/${slug}`} target="_blank" className="ml-auto rounded-md border-[1.5px] border-ink/20 px-3.5 py-2 font-display text-[12px] font-bold text-cyan-deep">SİTEDE GÖR ↗</a>
      </div>
      {msg && <p className="mt-4 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700">{msg}</p>}
      <div className="mt-4 rounded-xl border-2 border-ink bg-white p-5">
        <label className="block font-display text-[11px] font-semibold tracking-[1px] text-ink/55">BAŞLIK
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1.5 w-full rounded-md border-[1.5px] border-ink/20 px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:border-cyan-deep" />
        </label>
        <label className="mt-4 block font-display text-[11px] font-semibold tracking-[1px] text-ink/55">İÇERİK <span className="font-normal normal-case text-ink/40">(boş satır = yeni paragraf)</span>
          <textarea rows={16} value={body} onChange={e => setBody(e.target.value)}
            className="mt-1.5 w-full rounded-md border-[1.5px] border-ink/20 bg-paper px-4 py-3 text-[13.5px] leading-relaxed outline-none focus:border-cyan-deep" />
        </label>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={save} className="plate-hover rounded-md bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">YAYINLA</button>
          {updated && <span className="text-[12px] text-ink/45">Son güncelleme: {new Date(updated).toLocaleString("tr-TR")}</span>}
        </div>
      </div>
    </div>
  );
}
