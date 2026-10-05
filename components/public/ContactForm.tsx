"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const EMPTY = { name: "", email: "", phone: "", subject: "Genel", message: "", website: "" };
const field = "mt-1 w-full rounded-md border border-white/25 bg-white/[.08] px-3.5 py-3 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-brand";
const label = "mt-3 block text-xs font-semibold text-white/80";

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const sending = useRef(false);
  const set = (key: keyof typeof EMPTY, value: string) => setForm(current => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(response.status===403 ? "İşlem doğrulanamadı. Sayfayı yenileyerek tekrar deneyin." : body?.error || "Mesajınız kaydedilemedi. Bilgilerinizi kontrol edip tekrar deneyin.");
      if (!Number.isSafeInteger(body?.id) || body.id <= 0) throw new Error("Mesaj sonucu doğrulanamadı. Tekrar denemeden önce ekibimizle iletişime geçin.");
      setMessage(`Mesajınız kaydedildi. Referans: #${body.id}.`);
      setForm(EMPTY);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof TypeError ? "Sunucuya ulaşılamadı. Yazdıklarınız korunuyor; bağlantınızı kontrol edip tekrar deneyin." : error instanceof Error ? error.message : "Mesajınız kaydedilemedi. Tekrar deneyin.");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return <form onSubmit={submit} aria-busy={busy} className="rounded-xl bg-ink p-6">
    <h3 className="font-display text-[17px] font-bold text-cyan-brand">HIZLI MESAJ</h3>
    <label htmlFor="contact-name" className={label}>Adınız Soyadınız*</label>
    <input disabled={busy} id="contact-name" required maxLength={120} autoComplete="name" value={form.name} onChange={event => set("name", event.target.value)} className={field}/>
    <label htmlFor="contact-email" className={label}>E-posta*</label>
    <input disabled={busy} id="contact-email" required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={event => set("email", event.target.value)} className={field}/>
    <label htmlFor="contact-phone" className={label}>Telefon (opsiyonel)</label>
    <input disabled={busy} id="contact-phone" type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={event => set("phone", event.target.value)} className={field}/>
    <label htmlFor="contact-subject" className={label}>Konu</label>
    <select disabled={busy} id="contact-subject" value={form.subject} onChange={event => set("subject", event.target.value)} className={field+" bg-[#1d2638]"}>{["Genel", "Takım Desteği", "Kurumsal", "Basın", "Gönüllülük"].map(subject => <option key={subject}>{subject}</option>)}</select>
    <label htmlFor="contact-message" className={label}>Mesajınız*</label>
    <textarea disabled={busy} id="contact-message" required maxLength={5000} value={form.message} onChange={event => set("message", event.target.value)} rows={5} className={field}/>
    <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input disabled={busy} id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={event => set("website", event.target.value)}/></div>
    <p className="mt-3 text-xs leading-relaxed text-white/70">Gönderdiğiniz bilgiler için <Link href="/kvkk" target="_blank" className="text-cyan-brand underline">KVKK Aydınlatma Metni</Link>’ni inceleyebilirsiniz.</p>
    {message && <p role={failed ? "alert" : "status"} className={`mt-3 text-sm ${failed ? "text-red-200" : "text-cyan-brand"}`}>{message}</p>}
    <button disabled={busy} type="submit" className="mt-4 w-full rounded-md bg-cyan-brand py-3.5 font-display text-sm font-bold text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60">{busy ? "KAYDEDİLİYOR…" : "GÖNDER"}</button>
  </form>;
}
