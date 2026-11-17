"use client";
import {useMemo,useState} from "react";
import {FigmaIcon} from "@/components/FigmaIcon";
import Link from "next/link";
import LEGAL_DOCUMENTS from "@/lib/legal-document-links.json";
import {documentAvailability} from "@/lib/public-content";
import {LEGAL_VERSION} from "@/lib/site-config";

type Doc={id:number;name:string;cat:string;size_label:string;url:string;file_path?:string;updated_label:string;downloads:number;source?:string;program?:string;version_label?:string;language?:string};
const officialManuals=[{name:"Engage · Tier Takeover",slug:"engage"},{name:"Achieve · Pinnacle",slug:"achieve"},{name:"Inspire · Pinnacle",slug:"inspire"},{name:"ADC · Fast Track",slug:"adc"},{name:"ADC Pro · Off Grid",slug:"pro"}];

function DocRow({d,official}:{d:Doc;official:boolean}){
  const availability=documentAvailability(d);
  const meta=[d.program,d.version_label||d.updated_label,d.language?`Dil: ${d.language}`:"",d.cat].filter(Boolean).join(" · ");
  return <li className="flex min-w-0 flex-wrap items-center gap-4 rounded-lg border-[1.5px] border-ink/20 bg-white px-4 py-4 sm:px-5">
    <span className={`flex h-10 w-14 shrink-0 items-center justify-center rounded font-display text-xs font-bold ${official?"bg-ink text-cyan-brand":"bg-cyan-brand/15 text-ink"}`}>{official?"RECF":<FigmaIcon name="defter" className="h-6 w-6"/>}</span>
    <span className="min-w-0 flex-1"><span className="block break-words font-semibold text-ink">{d.name}</span><span className="block break-words text-[12.5px] text-ink/65">{meta}</span></span>
    {d.size_label&&availability.available&&<span className="hidden shrink-0 rounded bg-paper px-2.5 py-1 font-display text-xs font-medium text-ink/65 sm:block">{d.size_label}</span>}
    {availability.available?<a href={official&&/^https:\/\//.test(d.url)?d.url:`/api/documents/download?id=${d.id}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 py-2.5 font-display text-[12px] font-bold text-white transition-colors hover:bg-cyan-deep sm:w-auto">{official?"RESMÎ KAYNAKTA AÇ ↗":"İNDİR / AÇ"}<span className="sr-only"> — {d.name} (yeni sekmede açılır)</span></a>:<span className="flex min-h-11 w-full items-center justify-center rounded-md bg-paper px-4 py-2.5 text-xs font-semibold text-ink/65 sm:w-auto">{availability.message}</span>}
  </li>;
}

export default function DocumentDirectory({initialItems}:{initialItems:Doc[]}){
  const [q,setQ]=useState("");
  const match=(d:Doc)=>`${d.name} ${d.cat} ${d.program||""}`.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"));
  const official=useMemo(()=>initialItems.filter(d=>d.source==="recf"&&match(d)),[initialItems,q]); // eslint-disable-line react-hooks/exhaustive-deps
  const local=useMemo(()=>initialItems.filter(d=>d.source!=="recf"&&match(d)),[initialItems,q]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="safe-x mx-auto max-w-7xl lg:px-10">
    <section className="mb-8 rounded-xl border-2 border-ink bg-white p-5 sm:p-6" aria-labelledby="official-manuals-title"><h2 id="official-manuals-title" className="font-display text-xl font-bold">RESMÎ OYUN KILAVUZLARI</h2><p className="mt-2 text-sm leading-relaxed text-ink/65">Bağlayıcı İngilizce kılavuzlar, güncel sürümler ve resmî soru-cevaplar RECF’in oyun sitesinde yayımlanır.</p><div className="mt-4 flex flex-wrap gap-2">{officialManuals.map(m=><a key={m.slug} href={`https://games.recf.org/${m.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 py-2 text-xs font-bold text-white">{m.name} ↗<span className="sr-only"> (yeni sekmede açılır)</span></a>)}</div></section>
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="text-sm text-ink/65">Resmî RECF belgelerinin bağlantıları doğrudan RECF’in kendi sitesine (kb.roboticseducation.org, games.recf.org) gider; RECF Türkiye bu belgeleri kopyalamaz ve barındırmaz.</p><div className="relative w-full md:w-[320px]"><label htmlFor="document-search" className="sr-only">Doküman ara</label><input id="document-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Doküman ara…" className="w-full rounded-md border border-ink/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyan-deep"/></div></div>
    <section id="jury" className="scroll-mt-28" aria-labelledby="official-docs-title">
      <h2 id="official-docs-title" className="font-display text-[22px] font-bold text-ink">RESMÎ RECF BELGELERİ</h2>
      <p className="mt-1 text-sm text-ink/65">Jüri ve hakem rehberleri, rubrikler ve formlar · İngilizce · bağlayıcı sürüm.</p>
      {official.length?<ul className="mt-4 space-y-3">{official.map(d=><DocRow key={d.id} d={d} official/>)}</ul>:<p className="mt-4 rounded-lg border border-ink/15 bg-white p-6 text-ink/65">{q?"Aramaya uygun resmî belge yok.":"Resmî belge bağlantıları yakında burada listelenecek."}</p>}
    </section>
    <section className="mt-10" aria-labelledby="local-docs-title">
      <h2 id="local-docs-title" className="font-display text-[22px] font-bold text-ink">RECF TÜRKİYE BELGELERİ</h2>
      <p className="mt-1 text-sm text-ink/65">RECF Türkiye operasyonu için hazırlanan form ve yönergeler. Resmî RECF belgelerinin yerine geçmez.</p>
      {local.length?<ul className="mt-4 space-y-3">{local.map(d=><DocRow key={d.id} d={d} official={false}/>)}</ul>:<p className="mt-4 rounded-lg border border-ink/15 bg-white p-6 text-ink/65">{q?"Aramaya uygun belge yok.":"Yayınlanmış belge bulunmuyor."}</p>}
    </section>
    <section className="mt-10 rounded-xl border-2 border-ink bg-white p-5 sm:p-6" aria-labelledby="legal-documents-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="legal-documents-title" className="font-display text-xl font-bold">HUKUKİ BELGELER</h2><Link href="/hukuki-belgeler" className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-deep underline">TÜMÜ →</Link></div><div className="mt-4 grid gap-4 md:grid-cols-3">{LEGAL_DOCUMENTS.map(document=><article key={document.slug} className="rounded-lg border border-ink/15 p-4"><h3 className="font-display text-base font-bold">{document.title}</h3><p className="mt-2 text-xs text-ink/65">Sürüm {LEGAL_VERSION.version} · Yürürlük: {LEGAL_VERSION.effectiveLabel} · {document.pageCount} sayfa · PDF</p><div className="mt-3 flex flex-wrap gap-4"><Link href={`/${document.slug}`} className="inline-flex min-h-10 items-center text-xs font-bold text-cyan-deep underline">METNİ OKU →</Link><a href={document.pdf} download className="inline-flex min-h-10 items-center text-xs font-bold text-ink">PDF’İ İNDİR ↓</a></div></article>)}</div></section>
    <p className="mt-6 text-[13px] text-ink/65">Kural ve değerlendirme konularında bağlayıcı olan RECF’in resmî İngilizce belgeleridir.</p>
  </div>;
}
