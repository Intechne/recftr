"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { LEAD_CONFIG, leadReference, type LeadKindId } from "@/lib/leads";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { trackEvent } from "@/components/analytics/track";

type Props = { kind: LeadKindId; title: string; intro?: string; provinces?: string[]; submitLabel?: string; id?: string };

export default function LeadForm({ kind, title, intro, provinces = [], submitLabel = "GÖNDER", id }: Props) {
  const config = LEAD_CONFIG[kind];
  const blankChoices = Object.fromEntries(config.choices.map(choice => [choice.field, choice.multiple ? [] : ""])) as Record<string, string | string[]>;
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", role: "", city: "", message: "", kvkk: false, website: "" });
  const [choices, setChoices] = useState(blankChoices);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [result, setResult] = useState<{ id: number; confirmationEmail: string } | null>(null);
  const submissionKey = useRef("");
  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) => { submissionKey.current = ""; setForm(previous => ({ ...previous, [key]: value })); };
  const setChoice = (field: string, value: string | string[]) => { submissionKey.current = ""; setChoices(previous => ({ ...previous, [field]: value })); };
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-ink/25 bg-paper px-3.5 py-3 text-sm font-normal outline-none focus:border-cyan-deep disabled:opacity-50";
  const label = "block font-display text-[13px] font-semibold text-ink";
  const fid = (name: string) => `${kind}-${name}`;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!form.kvkk) { setError("Göndermek için KVKK Aydınlatma Metni'ni okuduğunuzu onaylayın."); return; }
    setBusy(true);
    try {
      if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, ...choices, kind, submissionKey: submissionKey.current }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(response.status === 429 ? "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin." : data.error || "Form gönderilemedi. Bilgilerinizi kontrol edip tekrar deneyin."); return; }
      if (!Number.isSafeInteger(data.id) || data.id < 1) { setError("Gönderim sonucu doğrulanamadı. Tekrar göndermeden önce bizimle iletişime geçin."); return; }
      trackEvent("lead_submit", { kind });
      setResult({ id: data.id, confirmationEmail: data.confirmationEmail });
    } catch { setError("Sunucuya ulaşılamadı. Yazdıklarınız korunuyor; bağlantınızı kontrol edip tekrar deneyin."); }
    finally { setBusy(false); }
  }

  if (result) return <div id={id} role="status" className="scroll-mt-28 rounded-xl border-2 border-ink bg-white p-6 sm:p-8">
    <p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">{config.label.toLocaleUpperCase("tr-TR")}</p>
    <h2 className="mt-3 font-display text-2xl font-bold">TALEBİN ALINDI.</h2>
    <p className="mt-4 rounded border-l-4 border-cyan-brand bg-cyan-brand/10 p-4 font-display font-bold">Referans: {leadReference(kind, result.id)}</p>
    <p className="mt-4 text-sm leading-relaxed text-ink/65">Ekibimiz <strong>{form.email}</strong> adresi üzerinden seninle iletişime geçecek.</p>
    <p className="mt-3 text-sm leading-relaxed text-ink/65">{result.confirmationEmail === "accepted" ? "Alındı bilgilendirmesini e-postanda kontrol edebilirsin; gelen kutusunda görünmüyorsa spam klasörüne de bak." : `Talebin kaydedildi. Otomatik e-posta şu anda iletilemedi; referans numaranı saklayabilir, ${PUBLIC_CONTACT.support} adresine yazabilirsin.`}</p>
  </div>;

  return <form id={id} onSubmit={submit} aria-busy={busy} className="scroll-mt-28 rounded-xl border-2 border-ink bg-white p-5 sm:p-7" noValidate={false}>
    <fieldset disabled={busy} className="space-y-5">
      <legend className="font-display text-xl font-bold">{title}</legend>
      {intro && <p className="text-sm leading-relaxed text-ink/65">{intro}</p>}
      <p className="text-xs text-ink/65">Yıldızlı (*) alanlar zorunludur.</p>
      <input name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px] h-px w-px opacity-0" value={form.website} onChange={event => set("website", event.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor={fid("name")} className={label}>Ad Soyad*<input id={fid("name")} required maxLength={120} autoComplete="name" className={input} value={form.name} onChange={event => set("name", event.target.value)} /></label>
        <label htmlFor={fid("email")} className={label}>E-posta*<input id={fid("email")} required type="email" maxLength={254} autoComplete="email" className={input} value={form.email} onChange={event => set("email", event.target.value)} /></label>
        <label htmlFor={fid("phone")} className={label}>Telefon<input id={fid("phone")} type="tel" maxLength={40} autoComplete="tel" className={input} value={form.phone} onChange={event => set("phone", event.target.value)} /><span className="mt-1 block text-xs font-normal text-ink/65">İsteğe bağlı.</span></label>
        {config.organization && <label htmlFor={fid("organization")} className={label}>{config.organization.label}{config.organization.required ? "*" : ""}<input id={fid("organization")} required={config.organization.required} maxLength={160} autoComplete="organization" className={input} value={form.organization} onChange={event => set("organization", event.target.value)} /></label>}
        {config.role && <label htmlFor={fid("role")} className={label}>{config.role.label}{config.role.required ? "*" : ""}<select id={fid("role")} required={config.role.required} className={input} value={form.role} onChange={event => set("role", event.target.value)}><option value="">Seçin</option>{config.role.options.map(option => <option key={option}>{option}</option>)}</select></label>}
        {config.city && <label htmlFor={fid("city")} className={label}>İl*<select id={fid("city")} required className={input} value={form.city} onChange={event => set("city", event.target.value)}><option value="">İl seçin</option>{provinces.map(province => <option key={province}>{province}</option>)}</select></label>}
      </div>
      {config.choices.map(choice => choice.multiple
        ? <fieldset key={choice.field} className="rounded-lg border border-ink/20 p-4"><legend className="px-1 font-display text-sm font-semibold">{choice.label}{choice.required ? "*" : ""}</legend><div className="grid gap-3 sm:grid-cols-2">{choice.options.map(option => { const picked = (choices[choice.field] as string[]) || []; return <label key={option} className="flex min-h-8 items-start gap-2.5 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-cyan-deep" checked={picked.includes(option)} onChange={event => setChoice(choice.field, event.target.checked ? [...picked, option] : picked.filter(x => x !== option))} /><span>{option}</span></label>; })}</div></fieldset>
        : <label key={choice.field} htmlFor={fid(choice.field)} className={label}>{choice.label}{choice.required ? "*" : ""}<select id={fid(choice.field)} required={choice.required} className={input} value={choices[choice.field] as string} onChange={event => setChoice(choice.field, event.target.value)}><option value="">Seçin</option>{choice.options.map(option => <option key={option}>{option}</option>)}</select></label>)}
      <label htmlFor={fid("message")} className={label}>{config.message.label}{config.message.required ? "*" : ""}<textarea id={fid("message")} required={config.message.required} rows={4} maxLength={3000} placeholder={config.message.placeholder} className={input} value={form.message} onChange={event => set("message", event.target.value)} /></label>
      <div className="space-y-3 border-t border-ink/15 pt-5">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-deep" checked={form.kvkk} onChange={event => set("kvkk", event.target.checked)} /><span><Link href="/kvkk" target="_blank" className="font-semibold text-cyan-deep underline">KVKK Aydınlatma Metni</Link>’ni okudum ve bilgi edindim.*</span></label>
        <p className="text-xs leading-relaxed text-ink/65">Bilgilerin yalnız bu talebin değerlendirilmesi ve seninle iletişime geçilmesi için kullanılır.</p>
      </div>
      {error && <p role="alert" className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold text-white shadow-plateSm shadow-cyan-brand disabled:opacity-50">{busy ? "GÖNDERİLİYOR…" : `${submitLabel} →`}</button>
    </fieldset>
  </form>;
}
