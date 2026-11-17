import Link from "next/link";
import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import { getCachedPrograms, getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { FigmaIcon } from "@/components/FigmaIcon";
import { badgeTextColor } from "@/lib/color";
import { copy } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("en-home");

export default async function EnglishHome() {
  const [page, programs] = await Promise.all([getSitePage("en-home"), getCachedPrograms()]);
  if (!page) notFound();
  return <SitePageView lang="en" kicker={page.kicker} title={page.title} body={page.body} action={{ label: `${copy("en").apply} (TR)`, href: "/kayit" }}
    aside={<div className="self-end overflow-hidden rounded-2xl border-2 border-ink bg-ink shadow-[0_24px_60px_rgba(6,12,26,.28)]"><p className="flex items-center gap-2 bg-white/5 px-5 py-4 font-display text-[14px] font-bold text-cyan-brand"><FigmaIcon name="kupa" className="h-5 w-5" /> SEASON PROGRAMS</p><ul className="px-2 py-2">{(programs as any[]).slice(0, 5).map(p => <li key={p.slug}><Link href="/en/programs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5"><span className="flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md font-display text-sm font-bold" style={{ backgroundColor: p.color_hex || "#29B9E5", color: badgeTextColor(p.color_hex || "#29B9E5") }}>{p.code}</span><span className="min-w-0 flex-1"><span className="block truncate font-display text-[15px] font-bold text-white">{p.name}</span><span className="block truncate text-[12px] text-white/60">{p.game}</span></span><span aria-hidden className="text-cyan-brand">→</span></Link></li>)}</ul></div>} />;
}
