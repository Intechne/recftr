"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHead } from "@/components/Ui";


const steps = ["PROGRAM SEÇİMİ", "TAKIM BİLGİLERİ", "MENTOR & ÜYELER", "ÖDEME & ONAY"];
export default function KayitPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [pricing,setPricing]=useState<any>({fees:{engage:3500,achieve:4500,inspire:5500,adc:4000,"adc-pro":6000},fieldKitFee:2800,discount:900});
  useEffect(() => { fetch("/api/programs").then(r => r.ok ? r.json() : []).then((rows:any[]) => { if(rows.length) setPrograms(rows.map(x=>({...x, ageDetail:x.age_detail||x.ageDetail}))); }).catch(()=>{}); fetch("/api/pricing").then(r=>r.ok?r.json():null).then(x=>x&&setPricing(x)).catch(()=>{}); }, []);
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState("achieve");
  const [form, setForm] = useState({ team: "", org: "", city: "", type: "Okul Takımı", num: "", mentor: "", email: "", phone: "", kit: false, done: false });
  const p = programs.find((x:any) => x.slug === prog) || programs[0] || {slug:prog,code:prog.toUpperCase(),name:prog,ageDetail:""};
  const total = useMemo(() => Math.max(0,(Number(pricing.fees?.[prog])||0)+(form.kit?(Number(pricing.fieldKitFee)||0):0)-(Number(pricing.discount)||0)), [prog, form.kit, pricing]);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const input = "w-full rounded-md border-[1.5px] border-ink/25 bg-paper px-3.5 py-3 text-[14.5px] outline-none focus:border-cyan-deep";
  const label = "block font-display text-[13px] font-semibold text-ink";

  return (
    <div className="pb-20">
      <PageHead kicker="SEZON 2026–27 BAŞVURUSU" title="TAKIM KAYDI" />
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {/* Adım göstergesi */}
        <ol className="flex flex-wrap items-center gap-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <button onClick={() => i < step && setStep(i)}
                className={`diamond flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink font-display text-[15px] font-bold ${i <= step ? "bg-cyan-brand" : "bg-white"}`}
                aria-current={i === step ? "step" : undefined}>
                <span>{i + 1}</span>
              </button>
              <span className={`font-display text-[12.5px] tracking-wide ${i <= step ? "font-bold text-ink" : "font-medium text-ink/45"}`}>{s}</span>
              {i < steps.length - 1 && <span className={`hidden h-0.5 w-14 lg:block ${i < step ? "bg-cyan-brand" : "bg-ink/15"}`} />}
            </li>
          ))}
        </ol>

        <div className="mt-9 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Form kartı */}
          <div className="rounded-xl border-2 border-ink bg-white p-7">
            {form.done ? (
              <div className="py-8 text-center">
                <p className="text-5xl" aria-hidden>✅</p>
                <h2 className="mt-4 font-display text-[24px] font-bold text-ink">BAŞVURUN ALINDI!</h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink/60">
                  {form.num || "— — —"} plakası için ön kaydın oluşturuldu{appId ? ` (Başvuru No: #${String(appId).padStart(4, "0")})` : ""}. Onay e-postası 24 saat içinde <strong>{form.email || "e-posta adresine"}</strong> gönderilecek.
                  Resmi kayıt recfevents.org üzerinde tamamlanır.
                </p>
                <Link href="/portal" className="mt-6 inline-block rounded-md bg-ink px-6 py-3.5 font-display text-[14px] font-bold text-white">TAKIM PORTALINA GİT →</Link>
              </div>
            ) : (
              <>
                <h2 className="font-display text-[20px] font-bold text-ink">ADIM {step + 1} — {steps[step]}</h2>

                {step === 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {programs.map((x) => (
                      <button key={x.slug} onClick={() => setProg(x.slug)}
                        className={`rounded-lg border-2 p-4 text-left transition-colors ${prog === x.slug ? "border-ink bg-cyan-brand/10" : "border-ink/15 hover:border-ink/40"}`}
                        aria-pressed={prog === x.slug}>
                        <span className="font-display text-[15px] font-bold text-ink">{x.code} — {x.name.replace("RECF ", "")}</span>
                        <span className="mt-1 block text-[12.5px] text-ink/55">{x.ageDetail}</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="mt-5 space-y-4">
                    <div><span className={label}>Takım Adı*</span><input className={input} value={form.team} onChange={(e) => set("team", e.target.value)} /></div>
                    <div><span className={label}>Okul / Kurum*</span><input className={input} value={form.org} onChange={(e) => set("org", e.target.value)} /></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><span className={label}>İl / İlçe*</span><input className={input} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
                      <div><span className={label}>Kuruluş Tipi*</span>
                        <select className={input} value={form.type} onChange={(e) => set("type", e.target.value)}>
                          {["Okul Takımı", "Kulüp / Dernek", "Bağımsız Topluluk"].map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><span className={label}>Tercih Edilen Takım No</span>
                      <input className={input} value={form.num || "— — —"} onChange={(e) => set("num", e.target.value.toUpperCase())} placeholder="Örn. 123A (müsaitlik kontrol edilecek)" maxLength={7} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-5 space-y-4">
                    <div><span className={label}>Mentor Ad Soyad* (18+)</span><input className={input} value={form.mentor} onChange={(e) => set("mentor", e.target.value)} placeholder="Örn. Ahmet Yılmaz" /></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><span className={label}>E-posta*</span><input type="email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="mentor@okul.k12.tr" /></div>
                      <div><span className={label}>GSM*</span><input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" /></div>
                    </div>
                    <p className="rounded-lg bg-paper px-4 py-3 text-[13px] text-ink/60">
                      ℹ️ Öğrenci üyeler kayıt sonrası Takım Portalı üzerinden davet edilir; 18 yaş altı üyeler için KVKK veli izni portalda toplanır.
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="mt-5 space-y-4">
                    <label className="flex items-start gap-3 rounded-lg border-[1.5px] border-ink/20 p-4">
                      <input type="checkbox" checked={form.kit} onChange={(e) => set("kit", e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-deep" />
                      <span><span className="font-semibold text-ink">Saha kiti eklensin (₺{Number(pricing.fieldKitFee||0).toLocaleString("tr-TR")})</span>
                        <span className="block text-[13px] text-ink/55">Antrenman için resmi oyun elemanları seti — opsiyonel.</span></span>
                    </label>
                    <label className="flex items-start gap-3 text-[13.5px] text-ink/70">
                      <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-cyan-deep" />
                      <span>Kişisel verilerin <u>aydınlatma metni</u> kapsamında işlenmesini kabul ediyorum.*</span>
                    </label>
                    <p className="rounded-lg bg-paper px-4 py-3 text-[13px] text-ink/60">
                      💳 Ödeme, başvuru onayı sonrası e-postana gelen güvenli bağlantı üzerinden alınır. Erken kayıt indirimi (−₺900) otomatik uygulanmıştır.
                    </p>
                  </div>
                )}

                {err && <p className="mt-5 rounded-lg border-2 border-red-500 bg-red-50 px-4 py-3 text-[13.5px] font-semibold text-red-700">{err}</p>}

                <div className="mt-7 flex items-center justify-between">
                  <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                    className="rounded-md border-2 border-ink bg-white px-5 py-3 font-display text-[13px] font-bold text-ink disabled:opacity-30">← GERİ</button>
                  {step < 3 ? (
                    <button onClick={() => setStep((s) => s + 1)} className="plate-hover rounded-md bg-cyan-brand px-6 py-3 font-display text-[13px] font-bold text-ink shadow-plateSm shadow-ink/20">DEVAM ET →</button>
                  ) : (
                    <button disabled={busy} onClick={async () => {
                      setErr(""); setBusy(true);
                      try {
                        const r = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ num: form.num.toUpperCase(), team: form.team, org: form.org, city: form.city, type: form.type, program: prog, mentor: form.mentor, email: form.email, phone: form.phone, kit: form.kit, total }) });
                        const j = await r.json();
                        if (!r.ok) { setErr(j.error ?? "Başvuru gönderilemedi."); setBusy(false); return; }
                        setAppId(j.id); set("done", true);
                      } catch { setErr("Sunucuya ulaşılamadı — tekrar deneyin."); }
                      setBusy(false);
                    }} className="plate-hover rounded-md bg-ink px-6 py-3 font-display text-[13px] font-bold text-white shadow-plateSm shadow-cyan-brand disabled:opacity-50">{busy ? "GÖNDERİLİYOR…" : "BAŞVURUYU GÖNDER"}</button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sağ: canlı plaka + ücret özeti */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-xl border-[3px] border-cyan-brand bg-white shadow-plate shadow-cyan-brand/45">
              <div className="flex items-center justify-between bg-ink px-4 py-2.5">
                <span className="font-display text-[12px] font-bold text-cyan-brand">PLAKA ÖNİZLEME</span>
                <span className="font-display text-[11px] font-medium text-white/60">{p.code} · 26–27</span>
              </div>
              <p className="py-5 text-center font-display text-[58px] font-bold tracking-[5px] text-ink">{form.num || "————"}</p>
              <p className="pb-4 text-center font-display text-[10.5px] font-medium tracking-[1px] text-ink/45">
                {(form.team || "TAKIMIN").toUpperCase()} · {(form.city.split("/")[0] || "").trim().toUpperCase()}
              </p>
            </div>
            <div className="rounded-xl bg-ink p-5">
              <h3 className="font-display text-[14px] font-bold text-cyan-brand">KAYIT ÖZETİ</h3>
              <dl className="mt-3 space-y-2.5 text-[13.5px]">
                <div className="flex justify-between"><dt className="text-white/70">Sezon lisansı ({p.code})</dt><dd className="font-display font-semibold text-white">₺{Number(pricing.fees?.[prog]||0).toLocaleString("tr-TR")}</dd></div>
                {form.kit && <div className="flex justify-between"><dt className="text-white/70">Saha kiti (opsiyonel)</dt><dd className="font-display font-semibold text-white">₺{Number(pricing.fieldKitFee||0).toLocaleString("tr-TR")}</dd></div>}
                <div className="flex justify-between"><dt className="text-white/70">Erken kayıt indirimi</dt><dd className="font-display font-semibold text-white">−₺{Number(pricing.discount||0).toLocaleString("tr-TR")}</dd></div>
              </dl>
              <div className="mt-3.5 flex items-center justify-between border-t border-white/20 pt-3">
                <span className="font-display text-[15px] font-bold text-white">TOPLAM</span>
                <span className="font-display text-[20px] font-bold text-cyan-brand">₺{total.toLocaleString("tr-TR")}</span>
              </div>
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink/50">
              Nasıl ilerleyeceğinden emin değil misin? <Link href="/rehber/takim-kaydi" className="font-semibold text-cyan-deep underline">Takım Kaydı Rehberi</Link>ni incele.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
