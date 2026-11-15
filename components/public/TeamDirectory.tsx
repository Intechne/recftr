"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {FOUNDING_100} from "@/lib/site-config";
import { copy } from "@/lib/copy";

// Public dizin yalnız takım adı, okul/kurum ve il içerir; kişisel veri bu bileşene hiç ulaşmaz.
type Team={num:string;name:string;school:string;city:string;program:string;founding_rank?:number};
const PROGRAM_LABEL:Record<string,string>={engage:"ENGAGE",achieve:"ACHIEVE",inspire:"INSPIRE",adc:"ADC","adc-pro":"ADC PRO"};

export default function TeamDirectory({initialItems}:{initialItems:Team[]}){
  const [q,setQ]=useState(""),[program,setProgram]=useState("TÜMÜ");
  const programs=["TÜMÜ",...Array.from(new Set(initialItems.map(t=>t.program).filter(Boolean)))];
  const shown=useMemo(()=>initialItems.filter(t=>(program==="TÜMÜ"||t.program===program)&&`${t.num} ${t.name} ${t.school} ${t.city}`.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"))),[initialItems,q,program]);
  if(initialItems.length===0)return <div className="safe-x mx-auto max-w-7xl lg:px-10"><div className="rounded-xl border-2 border-dashed border-ink/25 bg-white p-8 text-center sm:p-12"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">FOUNDING 100</p><h2 className="mt-3 font-display text-2xl font-bold">KURUCU TAKIMLAR ÇOK YAKINDA BURADA.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink/65">Liste, takımların yayın onamı ve ekibimizin onayıyla güncellenir. Yalnız takım adı, okul ve il bilgisi yayınlanır.</p><Link href="/kayit" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-ink px-5 py-3 font-display text-[13px] font-bold text-white">{copy().apply} →</Link></div></div>;
  return <div className="safe-x mx-auto max-w-7xl lg:px-10">
    <div className="grid gap-3 md:grid-cols-[1fr_auto]"><label htmlFor="team-search" className="sr-only">Takım ara</label><input id="team-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Takım numarası, isim, okul veya il ara…" className="min-h-12 min-w-0 rounded-lg border-2 border-ink/20 bg-white px-4 py-3 outline-none focus:border-cyan-deep"/><label htmlFor="team-program" className="sr-only">Program filtresi</label><select id="team-program" value={program} onChange={e=>setProgram(e.target.value)} className="min-h-12 min-w-0 rounded-lg border-2 border-ink/20 bg-white px-4 py-3 font-semibold">{programs.map(p=><option key={p} value={p}>{PROGRAM_LABEL[p]||p}</option>)}</select></div>
    <p className="mt-4 text-sm text-ink/65" role="status">{shown.length} takım gösteriliyor.</p>
    <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{shown.map(t=>{const founding=!!t.founding_rank&&t.founding_rank<=FOUNDING_100.target;return <li key={t.num} className={`min-w-0 rounded-xl border-2 bg-white p-5 ${founding?"border-ink shadow-plateSm shadow-cyan-brand":"border-ink/20"}`}>
      <div className="flex min-w-0 items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-cyan-brand">{t.num}</div><div className="min-w-0"><p className="break-words font-display text-[12px] font-bold tracking-wider text-cyan-deep">{PROGRAM_LABEL[t.program]||t.program}</p><h2 className="mt-1 break-words font-display text-lg font-bold text-ink">{t.name}</h2><p className="mt-1 break-words text-sm text-ink/65">{t.school} · {t.city}</p></div></div>
      {founding&&<p className="mt-4 inline-flex rounded bg-cyan-brand px-2.5 py-1 font-display text-[10.5px] font-bold tracking-[1px] text-ink">FOUNDING 100 · KURUCU #{t.founding_rank}</p>}
    </li>})}{shown.length===0&&<li className="col-span-full rounded-xl border border-ink/15 bg-white p-8 text-center text-ink/65">Eşleşen takım bulunamadı.</li>}</ul>
  </div>;
}
