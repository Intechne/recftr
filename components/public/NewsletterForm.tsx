"use client";
import Link from "next/link";
import { useState } from "react";
import { NEWSLETTER_CONSENT_TEXT, NEWSLETTER_CONSENT_TEXT_EN } from "@/lib/newsletter";
import { trackEvent } from "@/components/analytics/track";

export default function NewsletterForm({ lang = "tr" }: { lang?: "tr" | "en" }) {
  const en = lang === "en";
  const [email, setEmail] = useState(""), [consent, setConsent] = useState(false), [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [failed, setFailed] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setFailed(false);
    if (!consent) { setFailed(true); setMessage(en ? "Please tick the consent box to subscribe." : "Bülten için açık rıza onay kutusunu işaretleyin."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent, website, source: en ? "footer-en" : "footer" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(response.status === 429 ? (en ? "Too many attempts. Please try again later." : "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.") : data.error || (en ? "Subscription failed." : "Bülten kaydı yapılamadı."));
      trackEvent("newsletter_submit", { source: en ? "footer-en" : "footer" });
      setMessage(en ? "Thank you! You are on the list." : "Teşekkürler! Bülten listesindesin.");
      setEmail(""); setConsent(false);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof TypeError ? (en ? "Could not reach the server. Please try again." : "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.") : error instanceof Error ? error.message : "Bülten kaydı yapılamadı.");
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} aria-busy={busy} className="rounded-xl border-2 border-ink bg-paper p-4 sm:p-5">
    <h3 className="font-display text-[13px] font-bold tracking-[2px] text-ink">{en ? "NEWSLETTER" : "E-POSTA BÜLTENİ"}</h3>
    <p className="mt-1.5 text-[13px] leading-relaxed text-ink/65">{en ? "Season news, events and program updates." : "Sezon haberleri, etkinlikler ve program duyuruları."}</p>
    <div className="mt-3 flex flex-col gap-2 min-[420px]:flex-row">
      <label htmlFor={`newsletter-email-${lang}`} className="sr-only">{en ? "Email address" : "E-posta adresi"}</label>
      <input id={`newsletter-email-${lang}`} type="email" required maxLength={254} autoComplete="email" placeholder={en ? "you@example.com" : "eposta@ornek.com"} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} className="min-h-11 min-w-0 flex-1 rounded-md border-[1.5px] border-ink/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-cyan-deep" />
      <button type="submit" disabled={busy} className="min-h-11 rounded-md bg-ink px-4 py-2.5 font-display text-xs font-bold text-white disabled:opacity-50">{busy ? "…" : en ? "SUBSCRIBE" : "KAYDOL"}</button>
    </div>
    <div hidden aria-hidden="true"><label htmlFor={`newsletter-website-${lang}`}>Website</label><input id={`newsletter-website-${lang}`} tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
    <label className="mt-3 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink/65"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} disabled={busy} className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-deep" /><span>{en ? NEWSLETTER_CONSENT_TEXT_EN : NEWSLETTER_CONSENT_TEXT} <Link href="/acik-riza" className="font-semibold text-cyan-deep underline">{en ? "Explicit consent notice (TR)" : "Açık Rıza Metni"}</Link> · <Link href="/kvkk" className="font-semibold text-cyan-deep underline">{en ? "Privacy notice (TR)" : "KVKK"}</Link>*</span></label>
    {message && <p role={failed ? "alert" : "status"} className={`mt-2.5 text-[13px] font-semibold ${failed ? "text-red-700" : "text-cyan-deep"}`}>{message}</p>}
  </form>;
}
