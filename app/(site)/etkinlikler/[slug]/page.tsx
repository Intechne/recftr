import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {getEvent} from "@/lib/db";

export const dynamic="force-dynamic";
export const revalidate=0;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;const e:any=await getEvent(slug);return {title:e?.title||'Etkinlik',description:e?.excerpt||undefined};
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const e:any=await getEvent(slug);if(!e)notFound();
  return <div className="pb-20"><div className="bg-ink text-white"><div className="safe-x mx-auto grid max-w-7xl gap-7 py-10 sm:py-14 lg:grid-cols-[1.2fr_.8fr] lg:gap-8 lg:px-10"><div className="min-w-0"><span className="rounded bg-cyan-brand px-2 py-1 text-[11px] font-bold text-ink">{e.code}</span><h1 className="mt-4 break-words font-display text-[clamp(2rem,8vw,2.75rem)] font-bold leading-tight sm:text-[40px] 2xl:text-[48px]">{e.title}</h1><p className="mt-4 break-words text-white/65">{e.excerpt}</p></div>{e.cover_url&&<div className="cms-media-frame aspect-video rounded-xl bg-black/10 lg:h-64 lg:aspect-auto"><img src={e.cover_url} alt={`${e.title} etkinlik görseli`} className="cms-media-cover rounded-xl"/></div>}</div></div><div className="safe-x mx-auto grid max-w-7xl gap-7 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:px-10 2xl:grid-cols-[minmax(0,1fr)_360px]"><article className="min-w-0 cms-content"><h2 className="font-display text-[22px] font-bold">ETKİNLİK DETAYI</h2><div className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink/65">{e.body||e.excerpt||'Detaylar yakında.'}</div></article><aside className="min-w-0 rounded-xl border-2 border-ink bg-white p-5"><p><b>Tarih:</b> {e.date_label}</p><p className="mt-2 break-words"><b>Konum:</b> {e.city} · {e.venue}</p><p className="mt-2"><b>Kontenjan:</b> {e.registered}/{e.capacity}</p><p className="mt-2"><b>Durum:</b> {e.status}</p><Link href="/giris" className="mt-5 block rounded bg-ink px-4 py-3 text-center font-display text-[12px] font-bold text-white">TAKIM PORTALINDAN KAYIT OL</Link></aside></div></div>;
}
