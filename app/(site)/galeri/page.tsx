import type { Metadata } from "next";
import Link from "next/link";
import CmsImage from "@/components/public/CmsImage";
import { pageMeta } from "@/lib/seo";
import {PageHead} from "@/components/Ui";
import {getCachedEvents,getCachedMedia} from "@/lib/public-cache";
export const metadata: Metadata = pageMeta({ title: "Galeri", description: "RECF Türkiye etkinliklerinden fotoğraflar, videolar ve saha anları.", path: "/galeri" });
export const dynamic="force-dynamic";
export const revalidate=0;
const isVideo=(m:any)=>/^v[iı]deo$/i.test(String(m.type||""))||/\.(mp4|webm|mov)(\?|$)/i.test(String(m.url||""));
export default async function Galeri({searchParams}:{searchParams:Promise<{etkinlik?:string|string[]}>}){
  const [items,events,query]=await Promise.all([getCachedMedia() as Promise<any[]>,getCachedEvents() as Promise<any[]>,searchParams]);
  // Etkinlik fotoğrafları CMS → Medya'da etkinliğe bağlanır; galeri etkinliğe göre süzülebilir.
  const eventTitles=new Map(events.map(e=>[e.slug,e.title]));
  const groups=[...new Set(items.map(m=>m.event_slug).filter((slug:string)=>slug&&eventTitles.has(slug)))] as string[];
  const selected=typeof query.etkinlik==="string"&&groups.includes(query.etkinlik)?query.etkinlik:"";
  const shown=selected?items.filter(m=>m.event_slug===selected):items;
  const chip=(active:boolean)=>`inline-flex min-h-11 items-center rounded border px-3.5 py-2 font-display text-[12px] font-bold ${active?"border-ink bg-ink text-white":"border-ink/25 bg-white text-ink hover:border-ink"}`;
  return <div className="pb-20"><PageHead kicker="MEDYA" title="GALERİ" sub="RECF Türkiye etkinliklerinden yayınlanmış fotoğraf ve videolar."/>
    {groups.length>0&&<nav aria-label="Etkinliğe göre filtrele" className="safe-x mx-auto mb-6 flex max-w-7xl flex-wrap gap-2 lg:px-10"><Link href="/galeri" aria-current={!selected?"page":undefined} className={chip(!selected)}>TÜMÜ</Link>{groups.map(slug=><Link key={slug} href={`/galeri?etkinlik=${encodeURIComponent(slug)}`} aria-current={selected===slug?"page":undefined} className={chip(selected===slug)}>{String(eventTitles.get(slug)).toLocaleUpperCase("tr-TR")}</Link>)}</nav>}
    <div className="safe-x mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 lg:px-10 2xl:grid-cols-4">{shown.map(m=><figure key={m.id} className="min-w-0 overflow-hidden rounded-xl border border-ink/15 bg-white">{isVideo(m)?<video src={m.url} controls preload="metadata" className="aspect-video w-full bg-black object-cover" aria-label={m.alt_text||m.title}/>:<a href={m.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-video overflow-hidden bg-ink"><CmsImage src={m.url} alt={m.alt_text||m.title||"RECF Türkiye etkinlik fotoğrafı"} sizes="(min-width:1536px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform hover:scale-[1.02]"/><span className="sr-only"> (tam boyut yeni sekmede açılır)</span></a>}<figcaption className="min-w-0 p-4"><p className="break-words font-semibold text-ink">{m.title}</p>{m.event_slug&&eventTitles.has(m.event_slug)&&<p className="mt-1 font-display text-[11px] font-bold tracking-[1px] text-cyan-deep">{eventTitles.get(m.event_slug)}</p>}{m.caption&&<p className="mt-1 break-words text-sm text-ink/60">{m.caption}</p>}</figcaption></figure>)}{shown.length===0&&<p className="col-span-full rounded-xl border border-ink/15 bg-white p-8 text-center text-ink/60">Henüz yayınlanmış medya bulunmuyor.</p>}</div></div>}
