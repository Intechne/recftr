"use client";
import Link from "next/link";
import {useMemo,useState} from "react";

export default function EventDirectory({initialItems}:{initialItems:any[]}){
  const [q,setQ]=useState(''),[code,setCode]=useState('TÜMÜ');
  const rows=useMemo(()=>initialItems.filter(e=>(code==='TÜMÜ'||e.code===code)&&`${e.title} ${e.city} ${e.venue}`.toLowerCase().includes(q.toLowerCase())),[initialItems,q,code]);
  return <div className="safe-x mx-auto max-w-7xl lg:px-10">
    <div className="flex flex-wrap gap-2">{['TÜMÜ','ENG','ACH','INS','ADC','PRO'].map(x=><button key={x} onClick={()=>setCode(x)} className={`rounded border px-3 py-2 text-[12px] font-bold ${code===x?'bg-ink text-white':'bg-white'}`}>{x}</button>)}<input className="min-h-11 min-w-0 flex-[1_1_180px] rounded border border-ink/20 px-3 sm:max-w-xs" placeholder="Etkinlik/şehir ara" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-5">{rows.map(e=><Link key={e.id} href={`/etkinlikler/${e.slug}`} className="min-w-0 overflow-hidden rounded-xl border-2 border-ink bg-white"><div className="cms-media-frame h-44 bg-ink">{e.cover_url&&<img src={e.cover_url} alt={`${e.title} etkinlik görseli`} className="cms-media-cover"/>}</div><div className="min-w-0 p-5"><div className="flex min-w-0 justify-between gap-2"><span className="rounded bg-cyan-brand px-2 py-1 text-[10px] font-bold">{e.code}</span><span className="text-right text-[11px] font-bold">{e.status}</span></div><h2 className="mt-3 break-words font-display text-[20px] font-bold">{e.title}</h2><p className="mt-2 break-words text-[13px] text-ink/55">{e.date_label}<br/>{e.city} · {e.venue}</p><p className="mt-4 font-display text-[12px] font-bold text-cyan-deep">{e.registered}/{e.capacity} TAKIM</p></div></Link>)}{rows.length===0&&<p className="text-ink/45">Eşleşen etkinlik yok.</p>}</div>
  </div>;
}
