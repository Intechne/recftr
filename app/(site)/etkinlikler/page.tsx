import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Etkinlik Takvimi", description: "RECF Türkiye etkinlik takvimi: yaklaşan ve geçmiş etkinlikler, duyurulmuş tarihler ve katılım bilgileri.", path: "/etkinlikler" });
import {PageHead} from "@/components/Ui";
import EventDirectory from "@/components/public/EventDirectory";
import Link from "next/link";
import {getCachedEvents,getCachedPublicSettings} from "@/lib/public-cache";
import {publicRoute} from "@/lib/season-route";
import {worldChampionship} from "@/lib/site-config";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function Page(){
  const [list,settings]=await Promise.all([getCachedEvents(),getCachedPublicSettings()]);
  // Türkiye kilometre taşları: CMS → Site Ayarları → Sezon Rotası; yalnız yayınlanmış ve tarihi teyitli adımlar.
  const route=publicRoute((settings as Record<string,string>).season_route,Date.now(),worldChampionship(settings as Record<string,unknown>));
  return <div className="pb-20"><PageHead kicker="2026–27 SEZONU" title="ETKİNLİKLER" sub="Yaklaşan ve geçmiş etkinlikler, duyurulmuş tarihler ve katılım bilgileri."/>
    {route.length>0&&<section aria-labelledby="milestones-title" className="safe-x mx-auto mb-10 max-w-7xl lg:px-10"><div className="rounded-xl border-2 border-ink bg-white p-5 sm:p-6"><h2 id="milestones-title" className="font-display text-[22px] font-bold">SEZON KİLOMETRE TAŞLARI</h2><p className="mt-1 text-sm text-ink/65">Yalnız tarihi teyit edilen adımlar gösterilir; yeni tarihler teyit edildikçe eklenir.</p><ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{route.map((step,i)=><li key={`${step.month}-${i}`} className={`rounded-lg border p-4 ${step.done?"border-ink/10 bg-paper":"border-ink/20"}`}><p className="font-display text-xs font-bold tracking-[1.5px] text-cyan-deep">{step.month}</p><p className="mt-1 font-display text-base font-bold">{step.link?(step.link.startsWith("/")?<Link href={step.link} className="underline decoration-ink/25 underline-offset-4">{step.label}</Link>:<a href={step.link} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/25 underline-offset-4">{step.label}<span className="sr-only"> (yeni sekmede açılır)</span></a>):step.label}</p>{step.date_label&&<p className="mt-1 text-sm text-ink/65">{step.date_label}</p>}</li>)}</ol></div></section>}
    <EventDirectory initialItems={list as any[]}/></div>;
}
