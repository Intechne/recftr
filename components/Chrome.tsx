"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { tickerItems } from "@/lib/data";

/* ── Duyuru şeridi (marquee) ───────────────────────────── */
export function Ticker() {
  const [items, setItems] = useState<string[]>(tickerItems);
  useEffect(() => {
    fetch("/api/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.ticker) { try { const t = JSON.parse(d.ticker); if (Array.isArray(t) && t.length) setItems(t); } catch {} }
    }).catch(() => {});
  }, []);

  const row = (
    <div className="flex items-center gap-9 pr-9">
      {items.map((m, i) => (
        <span key={i} className="flex items-center gap-9 whitespace-nowrap">
          <span className="font-display text-[12.5px] font-medium text-white">{m}</span>
          <span className="text-cyan-brand">•</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="bg-ink flex items-center gap-6 overflow-hidden py-[9px] pl-6" role="marquee" aria-label="Duyurular">
      <span className="z-10 flex shrink-0 items-center gap-2 rounded-[3px] bg-cyan-brand px-2.5 py-[3px] font-display text-[11px] font-bold tracking-wider text-ink">
        <span className="h-1.5 w-1.5 rounded-full bg-ink pulse-soft" /> DUYURU
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track flex w-max">{row}{row}</div>
      </div>
    </div>
  );
}

/* ── Nav ────────────────────────────────────────────────── */
const links = [
  { href: "/programlar", label: "Programlar" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/dokumanlar", label: "Dokümanlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="RECF Türkiye ana sayfa">
          <span className="font-display text-[26px] font-bold text-cyan-brand" aria-hidden>⬡</span>
          <span className="font-display text-[19px] font-bold tracking-wide text-ink lg:text-[21px]">RECF TÜRKİYE</span>
        </Link>
        <div className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-[15px] font-semibold transition-colors hover:text-cyan-deep ${path.startsWith(l.href) ? "text-cyan-deep" : "text-ink"}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden lg:block">
          <Link href="/kayit" className="plate-hover flex overflow-hidden rounded-md border-2 border-ink shadow-plateSm shadow-cyan-brand">
            <span className="bg-cyan-brand px-3 py-2.5 font-display text-[15px] font-bold text-ink">TR</span>
            <span className="bg-ink px-4 py-2.5 font-display text-[14px] font-bold text-white">TAKIM NUMARANI AL</span>
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden rounded-md border-2 border-ink px-3 py-2 font-display text-sm font-bold" aria-expanded={open} aria-label="Menü">
          {open ? "KAPAT ✕" : "MENÜ ☰"}
        </button>
      </nav>
      {open && (
        <div className="border-t border-ink/10 bg-white px-5 pb-5 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-ink/5 py-3 font-display text-[15px] font-semibold">
              {l.label}
            </Link>
          ))}
          <Link href="/kayit" onClick={() => setOpen(false)} className="mt-4 flex w-max overflow-hidden rounded-md border-2 border-ink">
            <span className="bg-cyan-brand px-3 py-2.5 font-display text-sm font-bold text-ink">TR</span>
            <span className="bg-ink px-4 py-2.5 font-display text-sm font-bold text-white">TAKIM NUMARANI AL</span>
          </Link>
        </div>
      )}
    </header>
  );
}

/* ── Footer ─────────────────────────────────────────────── */
const footCols = [
  { title: "PROGRAMLAR", links: [
    { label: "Engage", href: "/programlar/engage" },
    { label: "Achieve", href: "/programlar/achieve" },
    { label: "Inspire", href: "/programlar/inspire" },
    { label: "Aerial Drone Competition", href: "/programlar/adc" },
    { label: "ADC Pro", href: "/programlar/adc-pro" },
  ]},
  { title: "KATILIM", links: [
    { label: "Etkinlik Takvimi", href: "/etkinlikler" },
    { label: "Takım Kaydı Rehberi", href: "/rehber/takim-kaydi" },
    { label: "Mentor Nasıl Olunur?", href: "/rehber/mentor" },
    { label: "Takım Kaydı", href: "/kayit" },
    { label: "Takım Portalı", href: "/portal" },
  ]},
  { title: "HAKKIMIZDA", links: [
    { label: "Biz Kimiz", href: "/hakkimizda" },
    { label: "Ekibimiz", href: "/hakkimizda#ekibimiz" },
    { label: "Duyurular", href: "/duyurular" },
    { label: "İletişim", href: "/hakkimizda#iletisim" },
    { label: "KVKK & Gizlilik", href: "/hakkimizda#iletisim" },
  ]},
];

export function Footer() {
  return (
    <footer className="border-t-4 border-ink bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[26px] font-bold text-cyan-brand" aria-hidden>⬡</span>
            <span className="font-display text-[22px] font-bold text-ink">RECF TÜRKİYE</span>
          </div>
          <p className="mt-3.5 text-[13px] leading-relaxed text-ink/60">
            Türkiye Temsilcisi: Intechne Teknoloji A.Ş.<br />
            RECF programlarının Türkiye operasyonları<br />
            Intechne tarafından yürütülmektedir.
          </p>
          <p className="mt-3.5 font-display text-[12px] font-semibold tracking-wide text-cyan-deep">
            INSTAGRAM · YOUTUBE · LINKEDIN
          </p>
        </div>
        {footCols.map((c) => (
          <div key={c.title}>
            <h3 className="font-display text-[13px] font-bold tracking-[2px] text-ink">{c.title}</h3>
            <ul className="mt-4 space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[14px] text-ink/60 transition-colors hover:text-cyan-deep">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-ink/10 px-5 py-6 text-[12px] text-ink/50 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© 2026 RECF Türkiye | Intechne Teknoloji · RECF ve VEX Robotics ayrı kuruluşlardır.</p>
          <span className="mt-2 block space-x-4 text-[12px]"><a href="/kvkk" className="underline decoration-white/30 hover:text-cyan-brand">KVKK</a><a href="/gizlilik" className="underline decoration-white/30 hover:text-cyan-brand">Gizlilik</a><a href="/cms-giris" className="opacity-40 hover:opacity-100">Yönetim</a></span>
        <p className="font-display font-medium tracking-wide">MAÇ GÜNÜ. HER GÜN. ⬡</p>
      </div>
    </footer>
  );
}
