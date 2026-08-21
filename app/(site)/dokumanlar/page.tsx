"use client";
import {useEffect,useMemo,useState} from "react";
import {PageHead} from "@/components/Ui";
import {FigmaIcon,type FigmaIconName} from "@/components/FigmaIcon";

type Doc={id:number;name:string;cat:string;size_label:string;url:string;updated_label:string;downloads:number};
const categoryMeta:Record<string,{icon:FigmaIconName;desc:string;hex:string}>={
  "Oyun Kılavuzları":{icon:"defter",desc:"Sezon oyun kuralları ve teknik kılavuzlar",hex:"#29B9E5"},
  "Formlar":{icon:"kayit",desc:"Takım, etkinlik ve izin formları",hex:"#8DC63F"},
  "Jüri Belgeleri":{icon:"rozet",desc:"Değerlendirme rubrikleri ve jüri kaynakları",hex:"#F2A900"},
  "Marka":{icon:"yildiz",desc:"Logo, marka ve iletişim kullanım dosyaları",hex:"#ED1C24"},
};
const fallback={icon:"defter" as FigmaIconName,desc:"Yayınlanmış kaynak ve dokümanlar",hex:"#29B9E5"};
export default function DokumanlarPage(){
  const [items,setItems]=useState<Doc[]>([]),[cat,setCat]=useState("TÜMÜ"),[q,setQ]=useState("");
  useEffect(()=>{fetch("/api/documents").then(r=>r.ok?r.json():[]).then(x=>setItems(Array.isArray(x)?x:[]))},[]);
  const cats=useMemo(()=>Array.from(new Set(items.map(x=>x.cat).filter(Boolean))),[items]);
  const shown=useMemo(()=>items.filter(d=>(cat==="TÜMÜ"||d.cat===cat)&&(`${d.name} ${d.cat}`.toLowerCase().includes(q.toLowerCase()))),[items,cat,q]);
  const activeMeta=cat==="TÜMÜ"?{icon:"defter" as FigmaIconName,desc:"Tüm yayınlanmış dokümanlar",hex:"#29B9E5"}:(categoryMeta[cat]||fallback);
  return <div className="pb-20"><PageHead kicker="BİLGİ MERKEZİ" title="DOKÜMANLAR" sub="Sezon dokümanları, teknik dokümantasyon, koç kaynakları ve marka kiti — tek yerde."/><div className="safe-x mx-auto max-w-7xl lg:px-10">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {["TÜMÜ",...cats].slice(0,4).map(c=>{const m=c==="TÜMÜ"?{icon:"defter" as FigmaIconName,desc:"Tüm yayınlanmış dosyalar",hex:"#29B9E5"}:(categoryMeta[c]||fallback);const count=c==="TÜMÜ"?items.length:items.filter(x=>x.cat===c).length;return <button key={c} onClick={()=>setCat(c)} className={`plate-hover rounded-xl border-2 border-ink bg-white p-5 text-left shadow-plateSm transition-all ${cat===c?"":"opacity-80 hover:opacity-100"}`} style={{["--tw-shadow-color" as string]:m.hex,outline:cat===c?`3px solid ${m.hex}`:"none",outlineOffset:2}} aria-pressed={cat===c}><FigmaIcon name={m.icon} className="h-8 w-8 text-ink"/><h2 className="mt-3 font-display text-[15px] font-bold text-ink">{c}</h2><p className="mt-1.5 min-h-[38px] text-[12.5px] leading-relaxed text-ink/55">{m.desc}</p><p className="mt-2.5 font-display text-[12px] font-semibold text-ink">{count} DOSYA →</p></button>})}
    </div>
    {cats.length>3&&<div className="mt-4 flex flex-wrap gap-2">{cats.slice(3).map(c=><button key={c} onClick={()=>setCat(c)} className={`rounded-md border px-3.5 py-2 text-sm font-semibold ${cat===c?"border-ink bg-ink text-white":"border-ink/20 bg-white"}`}>{c}</button>)}</div>}
    <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><FigmaIcon name={activeMeta.icon} className="h-6 w-6 text-ink"/><h2 className="font-display text-[22px] font-bold text-ink">{cat==="TÜMÜ"?"TÜM DOKÜMANLAR":cat.toUpperCase()} 2026–27</h2></div><div className="relative w-full md:w-[320px]"><FigmaIcon name="rota" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Doküman ara…" className="w-full rounded-md border border-ink/20 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-deep"/></div></div>
    <div className="mt-4 space-y-3.5">{shown.length===0?<p className="rounded-lg border border-ink/15 bg-white p-8 text-center text-ink/50">Yayınlanmış doküman bulunmuyor.</p>:shown.map(d=><div key={d.id} className="flex flex-wrap items-center gap-4 rounded-lg border-[1.5px] border-ink/20 bg-white px-5 py-4"><span className="flex h-10 w-14 items-center justify-center rounded bg-cyan-brand/15 text-ink"><FigmaIcon name="defter" className="h-6 w-6"/></span><span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{d.name}</span><span className="block text-[12.5px] text-ink/50">{d.cat}{d.updated_label?` · ${d.updated_label}`:""}</span></span>{d.size_label&&<span className="hidden rounded bg-paper px-2.5 py-1 font-display text-[11px] font-medium text-ink/60 sm:block">{d.size_label}</span>}<a href={`/api/documents/download?id=${d.id}`} target="_blank" rel="noreferrer" className="flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 py-2.5 font-display text-[12px] font-bold text-white transition-colors hover:bg-cyan-deep sm:w-auto">İNDİR / AÇ</a></div>)}</div>
    <p className="mt-6 text-[13px] text-ink/45">Kılavuzların İngilizce asılları RECF resmi kaynaklarında yayınlanır; Türkçe çeviriler RECF Türkiye tarafından sağlanır. Sürüm farkında İngilizce asıl geçerlidir.</p>
  </div></div>
}
