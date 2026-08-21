"use client";
import { useEffect, useState } from "react";

export default function AyarlarPage() {
  const [num, setNum] = useState("");
  const [p, setP] = useState({ name: "", school: "", city: "", slogan: "", email: "", phone: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("/api/team").then(r => r.ok ? r.json() : null).then(d => { if (d) { setNum(d.num); setP(prev => ({ ...prev, ...d.profile })); } });
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
    setMsg(r.ok ? "✓ Kaydedildi — yayın ekranları güncellendi." : "⚠ Kaydedilemedi.");
  };
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-cyan-deep";
  const label = "block font-display text-[11.5px] font-semibold tracking-[1px] text-ink/60";
  const set = (k: string, v: string) => setP(prev => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[26px] font-bold text-ink">TAKIM AYARLARI</h1>
      <p className="mt-1 text-[14.5px] text-ink/60">Takım kimliği — veritabanına kaydedilir, yayın ekranlarında kullanılır.</p>
      {msg && <p className="mt-4 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700">{msg}</p>}
      <form onSubmit={save} className="mt-6 rounded-xl border-2 border-ink bg-white p-6 shadow-plateSm shadow-cyan-brand">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-center gap-5 sm:col-span-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-ink/25 bg-paper font-display text-[22px] font-bold text-ink/40">{num || "—"}</div>
            <div>
              <p className="font-display text-[13px] font-bold text-ink">TAKIM NUMARASI</p>
              <p className="text-[12px] text-ink/50">Plaka değişikliği yalnızca RECF Türkiye onayıyla yapılır.</p>
            </div>
          </div>
          <label className={label}>TAKIM ADI<input value={p.name} onChange={e => set("name", e.target.value)} placeholder="Takımınızın adı" className={input} /></label>
          <label className={label}>OKUL / KURUM<input value={p.school} onChange={e => set("school", e.target.value)} placeholder="Okul veya kurum" className={input} /></label>
          <label className={label}>ŞEHİR<input value={p.city} onChange={e => set("city", e.target.value)} placeholder="Şehir" className={input} /></label>
          <label className={label}>MENTOR E-POSTA<input value={p.email} onChange={e => set("email", e.target.value)} placeholder="mentor@okul.org" className={input} /></label>
          <label className={label}>TELEFON<input value={p.phone} onChange={e => set("phone", e.target.value)} placeholder="05xx xxx xx xx" className={input} /></label>
          <label className={label}>TAKIM SLOGANI<input value={p.slogan} onChange={e => set("slogan", e.target.value)} placeholder="Yayın alt bandında görünür" className={input} /></label>
        </div>
        <button className="plate-hover mt-6 rounded-md bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">KAYDET</button>
      </form>
      <div className="mt-6 rounded-xl border-2 border-red-500 bg-red-50 p-6">
        <p className="font-display text-[14px] font-bold text-red-700">TEHLİKELİ BÖLGE</p>
        <p className="mt-1 text-[13px] text-red-700/70">Bu işlemler RECF Türkiye ekibi onayı gerektirir: takim@recfturkiye.org</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="rounded-md border-2 border-red-600 px-4 py-2 font-display text-[12.5px] font-bold text-red-700 hover:bg-red-600 hover:text-white">SEZONU DONDUR</button>
          <button type="button" className="rounded-md border-2 border-red-600 px-4 py-2 font-display text-[12.5px] font-bold text-red-700 hover:bg-red-600 hover:text-white">MENTOR DEVRİ TALEP ET</button>
        </div>
      </div>
    </div>
  );
}
