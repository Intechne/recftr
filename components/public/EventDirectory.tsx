"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {eventPhase} from "@/lib/public-content";

export default function EventDirectory({initialItems}:{initialItems:any[]}){
  const [q,setQ]=useState(''),[code,setCode]=useState('TÜMÜ'),[period,setPeriod]=useState('upcoming');
  const rows=useMemo(()=>initialItems.filter(e=>(code==='TÜMÜ'||e.code===code||e.code==='TÜMÜ')&&(period==='all'||(period==='past'?eventPhase(e)==='past':eventPhase(e)!=='past'))&&`${e.title} ${e.city} ${e.venue}`.toLowerCase().includes(q.toLowerCase())),[initialItems,q,code,period]);
  return <div className="safe-x mx-auto max-w-7xl lg:px-10">
    <div className="mb-4 flex flex-wrap gap-2">{[{value:"upcoming",label:"YAKLAŞAN"},{value:"past",label:"GEÇMİŞ"},{value:"all",label:"TÜM ETKİNLİKLER"}].map(p=><button key={p.value} aria-pressed={period===p.value} onClick={()=>setPeriod(p.value)} className={`min-h-11 rounded border border-ink px-4 py-2 text-xs font-bold ${period===p.value?"bg-ink text-white":"bg-white"}`}>{p.label}</button>)}</div>
    <div className="flex flex-wrap gap-2">{['TÜMÜ','ENG','ACH','INS','ADC','PRO'].map(x=><button key={x} onClick={()=>setCode(x)} className={`rounded border px-3 py-2 text-[12px] font-bold ${code===x?'bg-ink text-white':'bg-white'}`}>{x}</button>)}<input aria-label="Etkinlik veya şehir ara" className="min-h-11 min-w-0 flex-[1_1_180px] rounded border border-ink/20 px-3 sm:max-w-xs" placeholder="Etkinlik/şehir ara" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-5">{rows.map(e=><Link key={e.id} href={`/etkinlikler/${e.slug}`} className="min-w-0 overflow-hidden rounded-xl border-2 border-ink bg-white"><div className="cms-media-frame h-44 bg-ink">{e.cover_url&&<img src={e.cover_url} alt={`${e.title} etkinlik görseli`} className="cms-media-cover"/>}</div><div className="min-w-0 p-5"><div className="flex min-w-0 justify-between gap-2"><span className="rounded bg-cyan-brand px-2 py-1 text-[10px] font-bold">{e.code}</span><span className="text-right text-[11px] font-bold">{e.status}</span></div><h2 className="mt-3 break-words font-display text-[20px] font-bold">{e.title}</h2><p className="mt-2 break-words text-[13px] text-ink/55">{e.date_label}<br/>{e.city} · {e.venue}</p><p className="mt-4 font-display text-[12px] font-bold text-cyan-deep">{e.registered}/{e.capacity} TAKIM</p></div></Link>)}{rows.length===0&&<p className="text-ink/45">Bu filtrelerde gösterilecek etkinlik yok.</p>}</div>
  </div>;
}
