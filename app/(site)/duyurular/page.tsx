"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { news } from "@/lib/data";
import { PageHead, Photo } from "@/components/Ui";

const tagColors: Record<string, string> = {
  "DUYURU": "#29B9E5", "ETKİNLİK": "#1E8CD9", "BAŞARI": "#8DC63F", "BASINDA BİZ": "#93268F",
};

type DbNews = { slug: string; tag: string; title: string; excerpt: string; date: string };

export default function DuyurularPage() {
  const [tag, setTag] = useState("TÜMÜ");
  const [dbNews, setDbNews] = useState<DbNews[]>([]);
  useEffect(() => {
    fetch("/api/news").then(r => r.ok ? r.json() : []).then(setDbNews).catch(() => {});
  }, []);
  const featured = news.find((n) => n.featured)!;
  const staticSlugs = new Set(news.map(n => n.slug));
  const fresh = dbNews.filter(n => !staticSlugs.has(n.slug)).map(n => ({ ...n, date: "Yeni", fresh: true as const }));
  const rest = [...fresh.filter(n => tag === "TÜMÜ" || n.tag === tag),
    ...news.filter((n) => !n.featured && (tag === "TÜMÜ" || n.tag === tag)).map(n => ({ ...n, fresh: false as const }))];
  return (
    <div className="pb-20">
      <PageHead kicker="HABER MERKEZİ" title="DUYURULAR & HABERLER" />
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex flex-wrap gap-2.5">
          {["TÜMÜ", "DUYURU", "ETKİNLİK", "BAŞARI", "BASINDA BİZ"].map((f) => (
            <button key={f} onClick={() => setTag(f)}
              className={`rounded-md border-[1.5px] px-4 py-2 font-display text-[13px] font-semibold transition-colors ${
                tag === f ? "border-ink bg-ink text-white" : "border-ink/25 bg-white text-ink hover:border-ink"}`}>
              {f}
            </button>
          ))}
        </div>

        {(tag === "TÜMÜ" || featured.tag === tag) && (
          <Link href={`/duyurular/${featured.slug}`}
            className="mt-8 flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate shadow-cyan-brand transition-transform hover:-translate-y-1 lg:flex-row">
            <Photo label="Sezon lansmanı sahnesi" tone="from-[#2e4780] to-ink" className="h-56 rounded-none lg:h-auto lg:w-[46%]" />
            <div className="flex-1 p-7 lg:p-9">
              <span className="rounded bg-cyan-brand px-2.5 py-1 font-display text-[11px] font-bold text-ink">{featured.tag} · ÖNE ÇIKAN</span>
              <h2 className="mt-3.5 font-display text-[24px] font-bold leading-tight text-ink lg:text-[28px]">{featured.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{featured.excerpt}</p>
              <p className="mt-4 font-display text-[12px] font-medium tracking-[1px] text-cyan-deep">{featured.date.toUpperCase()} · RECF TÜRKİYE · DEVAMINI OKU →</p>
            </div>
          </Link>
        )}

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((n) => (
            <Link key={n.slug} href={`/duyurular/${n.slug}`} className="flex h-full flex-col overflow-hidden rounded-xl border-[1.5px] border-ink/20 bg-white transition-shadow hover:shadow-lg">
              <Photo label={n.title.slice(0, 36) + "…"} tone="from-[#4c6688] to-ink" className="h-36 rounded-none" />
              <div className="flex flex-1 flex-col p-5">
                <span className="w-max rounded px-2 py-1 font-display text-[10px] font-bold tracking-wider"
                  style={{ backgroundColor: `${tagColors[n.tag]}22`, color: tagColors[n.tag] === "#29B9E5" ? "#1E8CD9" : tagColors[n.tag] }}>
                  {n.tag}
                </span>
                {"fresh" in n && n.fresh && <span className="ml-1.5 w-max rounded bg-emerald-600 px-1.5 py-1 font-display text-[9.5px] font-bold text-white">● CANLI</span>}
                <h3 className="mt-2.5 flex-1 font-semibold leading-snug text-ink">{n.title}</h3>
                <p className="mt-3 font-display text-[11px] font-medium tracking-wider text-ink/45">{n.date.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
