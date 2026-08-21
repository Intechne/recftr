"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type PublicSettings = {
  site_name?: string;
  ticker?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
};

const fallbackTicker = [
  "RECF Türkiye 2026–2027 sezonu başladı",
  "Takım kayıtları açık",
  "Etkinlik takvimini incele",
];

async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const response = await fetch("/api/settings", { cache: "no-store" });
    if (!response.ok) return {};
    return (await response.json()) as PublicSettings;
  } catch {
    return {};
  }
}

export function Ticker() {
  const [items, setItems] = useState<string[]>(fallbackTicker);

  useEffect(() => {
    void getPublicSettings().then((settings) => {
      if (!settings.ticker) return;

      try {
        const tickerItems: unknown = JSON.parse(settings.ticker);
        if (
          Array.isArray(tickerItems) &&
          tickerItems.length > 0 &&
          tickerItems.every((item) => typeof item === "string")
        ) {
          setItems(tickerItems);
        }
      } catch {
        // Keep fallback ticker when the CMS value is not valid JSON.
      }
    });
  }, []);

  const row = (
    <div className="flex items-center gap-9 pr-9">
      {items.map((message, index) => (
        <span key={`${message}-${index}`} className="flex items-center gap-9 whitespace-nowrap">
          <span className="font-display text-[12.5px] font-medium text-white">{message}</span>
          <span className="text-cyan-brand">•</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="flex items-center gap-6 overflow-hidden bg-ink py-[9px] pl-6">
      <span className="z-10 flex shrink-0 items-center gap-2 rounded-[3px] bg-cyan-brand px-2.5 py-[3px] font-display text-[11px] font-bold tracking-wider text-ink">
        ● DUYURU
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track flex w-max">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}

const links = [
  { href: "/programlar", label: "Programlar" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/dokumanlar", label: "Dokümanlar" },
  { href: "/takimlar", label: "Takımlar" },
  { href: "/galeri", label: "Galeri" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("RECF TÜRKİYE");

  useEffect(() => {
    void getPublicSettings().then((settings) => {
      if (settings.site_name) setName(settings.site_name);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-display text-[26px] font-bold text-cyan-brand">⬡</span>
          <span className="font-display text-[19px] font-bold tracking-wide text-ink">{name}</span>
        </Link>

        <div className="hidden items-center gap-5 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[14px] font-semibold hover:text-cyan-deep ${
                path.startsWith(link.href) ? "text-cyan-deep" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/giris" className="rounded-md border-2 border-ink px-3 py-2 font-display text-xs font-bold">
            TAKIM PORTALI
          </Link>
          <Link
            href="/kayit"
            className="rounded-md border-2 border-ink bg-ink px-4 py-2 font-display text-xs font-bold text-white shadow-plateSm shadow-cyan-brand"
          >
            TAKIM KAYDI
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md border-2 border-ink px-3 py-2 font-display text-sm font-bold xl:hidden"
          aria-expanded={open}
          aria-label="Menüyü aç veya kapat"
        >
          {open ? "KAPAT ✕" : "MENÜ ☰"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-white px-5 pb-5 xl:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-ink/5 py-3 font-display text-sm font-semibold"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-2">
            <Link
              href="/giris"
              onClick={() => setOpen(false)}
              className="rounded border border-ink px-3 py-2 text-xs font-bold"
            >
              PORTAL
            </Link>
            <Link
              href="/kayit"
              onClick={() => setOpen(false)}
              className="rounded bg-ink px-3 py-2 text-xs font-bold text-white"
            >
              TAKIM KAYDI
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

const footCols = [
  {
    title: "PROGRAMLAR",
    links: [
      ["Engage", "/programlar/engage"],
      ["Achieve", "/programlar/achieve"],
      ["Inspire", "/programlar/inspire"],
      ["Aerial Drone Competition", "/programlar/adc"],
      ["ADC Pro", "/programlar/adc-pro"],
    ],
  },
  {
    title: "KATILIM",
    links: [
      ["Etkinlik Takvimi", "/etkinlikler"],
      ["Takımlar", "/takimlar"],
      ["Takım Kaydı", "/kayit"],
      ["Takım Portalı", "/giris"],
      ["Dokümanlar", "/dokumanlar"],
    ],
  },
  {
    title: "KURUMSAL",
    links: [
      ["Hakkımızda", "/hakkimizda"],
      ["Ekibimiz", "/hakkimizda#ekibimiz"],
      ["Duyurular", "/duyurular"],
      ["Galeri", "/galeri"],
      ["İletişim", "/hakkimizda#iletisim"],
    ],
  },
] satisfies Array<{ title: string; links: Array<[string, string]> }>;

export function Footer() {
  const [settings, setSettings] = useState<PublicSettings>({});

  useEffect(() => {
    void getPublicSettings().then(setSettings);
  }, []);

  const socialLinks = [
    ["Instagram", settings.instagram],
    ["YouTube", settings.youtube],
    ["LinkedIn", settings.linkedin],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <footer className="border-t-4 border-ink bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[26px] font-bold text-cyan-brand">⬡</span>
            <span className="font-display text-[22px] font-bold text-ink">{settings.site_name || "RECF TÜRKİYE"}</span>
          </div>
          <p className="mt-3.5 text-[13px] leading-relaxed text-ink/60">
            RECF programlarının Türkiye operasyonları, takım ve etkinlik süreçleri.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {socialLinks.map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[11px] font-bold tracking-wide text-cyan-deep hover:underline"
              >
                {label.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {footCols.map((column) => (
          <div key={column.title}>
            <h3 className="font-display text-[13px] font-bold tracking-[2px] text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[14px] text-ink/60 hover:text-cyan-deep">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-ink/10 px-5 py-6 text-[12px] text-ink/50 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© 2026 RECF Türkiye | Intechne Teknoloji</p>
        <div className="flex gap-4">
          <Link href="/kvkk" className="hover:text-cyan-deep">KVKK</Link>
          <Link href="/gizlilik" className="hover:text-cyan-deep">Gizlilik</Link>
          <Link href="/cms-giris" className="opacity-40 hover:opacity-100">Yönetim</Link>
        </div>
        <p className="font-display font-medium tracking-wide">MAÇ GÜNÜ. HER GÜN. ⬡</p>
      </div>
    </footer>
  );
}
