"use client";
import { useState } from "react";

export default function AyarlarPage() {
  const [saved, setSaved] = useState(false);
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-cyan-deep";
  const label = "block font-display text-[11.5px] font-semibold tracking-[1px] text-ink/60";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-[26px] font-bold text-ink">TAKIM AYARLARI</h1>
      <p className="mt-1 text-[14.5px] text-ink/60">Takım kimliği ve yayın ekranlarında görünen bilgiler.</p>

      <form onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        className="mt-6 rounded-xl border-2 border-ink bg-white p-6 shadow-plateSm shadow-cyan-brand">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-ink/25 bg-paper font-display text-[24px] font-bold text-ink/40">905A</div>
            <div>
              <p className="font-display text-[13px] font-bold text-ink">TAKIM LOGOSU</p>
              <p className="text-[12px] text-ink/50">SVG/PNG · kare · min 512px — sonuç ekranlarında kullanılır</p>
              <button type="button" className="mt-1.5 rounded-md border-[1.5px] border-ink px-3 py-1.5 font-display text-[11.5px] font-bold text-ink">LOGO YÜKLE</button>
            </div>
          </div>
          <label className={label}>TAKIM ADI<input defaultValue="Voltran Robotics" className={input} /></label>
          <label className={label}>TAKIM NUMARASI<input value="905A" disabled className={input + " cursor-not-allowed bg-paper text-ink/50"} /></label>
          <label className={label}>OKUL / KURUM<input defaultValue="Pendik Fen Lisesi" className={input} /></label>
          <label className={label}>ŞEHİR<input defaultValue="İstanbul" className={input} /></label>
          <label className={label + " sm:col-span-2"}>TAKIM SLOGANI (yayın alt bandı)<input defaultValue="Güç şemasında hata yok!" className={input} /></label>
          <label className={label}>MENTOR E-POSTA<input defaultValue="mentor@voltran.org" className={input} /></label>
          <label className={label}>TELEFON<input defaultValue="0500 000 00 00" className={input} /></label>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button className="plate-hover rounded-md bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">KAYDET</button>
          {saved && <span className="font-display text-[13px] font-bold text-emerald-700">✓ Kaydedildi</span>}
        </div>
      </form>

      <div className="mt-6 rounded-xl border-2 border-red-500 bg-red-50 p-6">
        <p className="font-display text-[14px] font-bold text-red-700">TEHLİKELİ BÖLGE</p>
        <p className="mt-1 text-[13px] text-red-700/70">Bu işlemler geri alınamaz ve RECF Türkiye ekibi onayı gerektirir.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-md border-2 border-red-600 px-4 py-2 font-display text-[12.5px] font-bold text-red-700 hover:bg-red-600 hover:text-white">SEZONU DONDUR</button>
          <button className="rounded-md border-2 border-red-600 px-4 py-2 font-display text-[12.5px] font-bold text-red-700 hover:bg-red-600 hover:text-white">MENTOR DEVRİ TALEP ET</button>
        </div>
      </div>
    </div>
  );
}
