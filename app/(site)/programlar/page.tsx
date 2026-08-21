"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {PageHead} from "@/components/Ui";

function arr(v:any){return Array.isArray(v)?v:[]}
function txt(v:any){return typeof v==="string"?v:(v==null?"":String(v))}

export default function ProgramlarPage(){
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let live=true;
    fetch('/api/programs',{cache:'no-store'})
      .then(async r=>{const j=await r.json().catch(()=>[]);return r.ok&&Array.isArray(j)?j:[]})
      .then(j=>{if(live)setItems(j)})
      .catch(()=>{if(live)setItems([])})
      .finally(()=>{if(live)setLoading(false)});
    return()=>{live=false};
  },[]);
  return <div className="pb-20">
    <PageHead kicker="PROGRAMLAR" title="RECF PROGRAMLARI" sub="Yaşa ve seviyeye göre doğru arenayı seç — robotikten drone yarışmalarına."/>
    <div className="safe-x mx-auto max-w-7xl space-y-5 lg:px-10">
      {items.map((raw:any)=>{const p=raw&&typeof raw==='object'?raw:{};const cover=txt(p.cover_url);const chips=arr(p.chips);return <div key={txt(p.slug)||Math.random()} className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate lg:flex-row lg:items-center" style={{['--tw-shadow-color' as string]:txt(p.color_hex)||'#29B9E5'}}>
        {cover?<img src={cover} alt={txt(p.name)||'Program kapak görseli'} className="h-36 w-full object-cover lg:h-[150px] lg:w-[210px]" onError={e=>{e.currentTarget.style.display='none'}}/>:<div className="flex h-24 items-center justify-center lg:h-[150px] lg:w-[150px]" style={{background:txt(p.color_hex)||'#29B9E5'}}><span className="font-display text-[38px] font-bold text-white">{txt(p.code)}</span></div>}
        <div className="flex-1 p-5 sm:p-6"><p className="font-display text-[11px] font-semibold tracking-wider" style={{color:txt(p.color_hex)||'#29B9E5'}}>{txt(p.age_detail)}</p><h2 className="mt-1 font-display text-[23px] font-bold text-ink">{txt(p.name)}</h2><p className="mt-2 text-sm leading-relaxed text-ink/55">{txt(p.game)&&<b>“{txt(p.game)}” · </b>}{txt(p.short)}</p><div className="mt-3 flex flex-wrap gap-2">{chips.slice(0,5).map((c:any,i:number)=><span key={`${txt(c)}-${i}`} className="rounded border border-ink/15 bg-paper px-2.5 py-1.5 font-display text-[10px] font-semibold">{txt(c)}</span>)}</div></div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 lg:pb-0"><Link href={`/programlar/${encodeURIComponent(txt(p.slug))}`} className="flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-5 py-3 font-display text-[13px] font-bold text-white lg:w-auto">PROGRAMA GİR →</Link></div>
      </div>})}
      {!loading&&items.length===0&&<p className="rounded-xl border border-ink/15 bg-white p-8 text-center text-ink/50">Yayınlanmış program bulunmuyor.</p>}
    </div>
  </div>
}
