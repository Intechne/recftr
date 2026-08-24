"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {Photo} from "@/components/Ui";

type News={slug:string;tag:string;title:string;excerpt:string;cover_url?:string;date:string;featured?:boolean;author?:string};
const tags=["TÜMÜ","DUYURU","ETKİNLİK","BAŞARI","BASINDA BİZ"];
const tagColors:Record<string,string>={DUYURU:"#29B9E5",ETKİNLİK:"#1E8CD9",BAŞARI:"#8DC63F","BASINDA BİZ":"#93268F"};
const fmt=(d:string)=>{try{return new Date(d).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}catch{return d}};

export default function NewsDirectory({initialItems}:{initialItems:News[]}){
 const [tag,setTag]=useState("TÜMÜ");
 const filtered=useMemo(()=>initialItems.filter(n=>tag==="TÜMÜ"||n.tag===tag),[initialItems,tag]);
 const featured=filtered.find(n=>n.featured) ?? filtered[0]; const rest=featured?filtered.filter(n=>n.slug!==featured.slug):filtered;
 return <div className="safe-x mx-auto max-w-7xl lg:px-10">
  <div className="flex flex-wrap gap-2.5">{tags.map(f=><button key={f} onClick={()=>setTag(f)} className={`rounded-md border-[1.5px] px-4 py-2 font-display text-[13px] font-semibold ${tag===f?"border-ink bg-ink text-white":"border-ink/25 bg-white text-ink hover:border-ink"}`}>{f}</button>)}</div>
  {!featured&&<div className="mt-8 rounded-xl border border-ink/15 bg-white p-8 text-center text-ink/55">Bu kategoride yayınlanmış içerik bulunmuyor.</div>}
  {featured&&<Link href={`/duyurular/${featured.slug}`} className="mt-8 flex min-w-0 flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate shadow-cyan-brand transition-transform hover:-translate-y-1 lg:flex-row">
    {featured.cover_url?<div className="cms-media-frame aspect-[16/9] shrink-0 lg:aspect-auto lg:w-[46%]"><img src={featured.cover_url} alt={featured.title} className="cms-media-cover"/></div>:<Photo label="Haber kapak görseli" tone="from-[#2e4780] to-ink" className="h-56 rounded-none lg:h-auto lg:w-[46%]"/>}
    <div className="min-w-0 flex-1 p-5 sm:p-7 lg:p-9"><span className="rounded bg-cyan-brand px-2.5 py-1 font-display text-[11px] font-bold text-ink">{featured.tag} · ÖNE ÇIKAN</span><h2 className="mt-3.5 break-words font-display text-[24px] font-bold leading-tight text-ink lg:text-[28px]">{featured.title}</h2><p className="mt-3 break-words text-[15px] leading-relaxed text-ink/60">{featured.excerpt}</p><p className="mt-4 font-display text-[12px] font-medium tracking-[1px] text-cyan-deep">{fmt(featured.date).toUpperCase()} · DEVAMINI OKU →</p></div>
  </Link>}
  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-5">{rest.map(n=><Link key={n.slug} href={`/duyurular/${n.slug}`} className="flex min-w-0 h-full flex-col overflow-hidden rounded-xl border-[1.5px] border-ink/20 bg-white transition-shadow hover:shadow-lg">
    {n.cover_url?<div className="cms-media-frame h-40"><img src={n.cover_url} alt={n.title} className="cms-media-cover"/></div>:<Photo label="Haber görseli" tone="from-[#4c6688] to-ink" className="h-40 rounded-none"/>}
    <div className="flex min-w-0 flex-1 flex-col p-5"><span className="w-max max-w-full rounded px-2 py-1 font-display text-[10px] font-bold tracking-wider" style={{backgroundColor:`${tagColors[n.tag]||"#29B9E5"}22`,color:tagColors[n.tag]||"#1E8CD9"}}>{n.tag}</span><h3 className="mt-2.5 flex-1 break-words font-semibold leading-snug text-ink">{n.title}</h3><p className="mt-3 font-display text-[11px] font-medium tracking-wider text-ink/45">{fmt(n.date).toUpperCase()}</p></div>
  </Link>)}</div>
 </div>
}
