"use client";

import {useMemo,useState} from "react";

type Fact={label?:unknown;value?:unknown};
type ScoreKey="floor"|"l1"|"l2"|"l3"|"l4"|"park";
type ScoreMap=Record<ScoreKey,number>;
type OfficialExample={
  ruleLabel:string;
  rows:Array<{label:string;detail:string;points:number}>;
  total:number;
  note:string;
  source:"api"|"fallback";
};
type LiveData={
  available:boolean;
  source:"api"|"fallback";
  versionLabel:string;
  publishedAt:string|null;
  releasedDateLabel:string|null;
  gameName:string;
  manualUrl:string;
  calculatorUrl:string;
  qnaUrl:string;
  apiDocsUrl:string;
  scores:ScoreMap;
  officialExample:OfficialExample|null;
  ruleSummary:{highestValue:string;colorMatching:string;l4:string;parking:string};
  fetchedAt:string;
};
type Props={facts?:Fact[];source?:string;live?:LiveData|null};

type ScoreItem={
  key:ScoreKey;
  kicker:string;
  title:string;
  fallback:number;
  factLabel:string;
  color:string;
  tint:string;
  description:string;
  ladderNote:string;
  max:number;
};

const ITEMS:ScoreItem[]=[
  {key:"floor",kicker:"FLOOR",title:"Floor Goal",fallback:1,factLabel:"Zemin",color:"#F59E0B",tint:"#FFF4DC",description:"Eşleşen renkli veya sarı bean bag başına.",ladderNote:"Eşleşen / sarı",max:38},
  {key:"l1",kicker:"L1",title:"L1 Goal",fallback:5,factLabel:"Katman 1",color:"#22C55E",tint:"#E4F8EA",description:"Eşleşen renkli veya sarı bean bag başına.",ladderNote:"Eşleşen / sarı",max:38},
  {key:"l2",kicker:"L2",title:"L2 Goal",fallback:10,factLabel:"Katman 2",color:"#8657EF",tint:"#EEE9FF",description:"Eşleşen renkli veya sarı bean bag başına.",ladderNote:"Eşleşen / sarı",max:38},
  {key:"l3",kicker:"L3",title:"L3 Goal",fallback:25,factLabel:"Katman 3",color:"#EF4444",tint:"#FDE8E8",description:"Eşleşen renkli veya sarı bean bag başına.",ladderNote:"Eşleşen / sarı",max:38},
  {key:"l4",kicker:"L4",title:"L4 Goal",fallback:50,factLabel:"Katman 4",color:"#EC4899",tint:"#FDE7F2",description:"Yalnızca sarı bean bag için geçerlidir.",ladderNote:"Sadece sarı",max:38},
  {key:"park",kicker:"PARK",title:"Parked Robot",fallback:25,factLabel:"Park",color:"#29B9E5",tint:"#E5F8FD",description:"Load zone içinde park eden her robot başına.",ladderNote:"Robot başına",max:2},
];

const OFFICIAL_INITIAL:ScoreMap={floor:0,l1:2,l2:2,l3:2,l4:0,park:0};
const ZERO:ScoreMap={floor:0,l1:0,l2:0,l3:0,l4:0,park:0};

function text(v:unknown){return typeof v==="string"?v:(v==null?"":String(v));}
function pointFromFacts(facts:Fact[]|undefined,label:string,fallback:number){
  const normalized=label.toLocaleLowerCase("tr-TR");
  const row=(facts||[]).find(f=>text(f?.label).toLocaleLowerCase("tr-TR").startsWith(normalized));
  const match=text(row?.value).match(/\d+/);
  return match?Number(match[0]):fallback;
}

export function EngageScoringSection({facts=[],source="",live=null}:Props){
  const scores=useMemo(()=>{
    if(live?.scores)return live.scores;
    return Object.fromEntries(ITEMS.map(item=>[item.key,pointFromFacts(facts,item.factLabel,item.fallback)])) as ScoreMap;
  },[facts,live]);
  const [counts,setCounts]=useState<ScoreMap>(OFFICIAL_INITIAL);
  const bagCount=counts.floor+counts.l1+counts.l2+counts.l3+counts.l4;
  const total=ITEMS.reduce((sum,item)=>sum+counts[item.key]*scores[item.key],0);
  const version=live?.versionLabel||"1.1";
  const gameName=live?.gameName||"Tier Takeover";
  const sourceHref=live?.manualUrl||(source?(source.startsWith("http")?source:`https://${source}`):`https://games.recf.org/engage/${version}`);
  const calculatorHref=live?.calculatorUrl||"https://games.recf.org/engage/calculator";
  const qnaHref=live?.qnaUrl||"https://games.recf.org/engage/qa";
  const officialExample=live?.officialExample||{
    ruleLabel:"3.1.7",
    rows:[
      {label:"Red L1",detail:"2 kırmızı bean bag",points:2*scores.l1},
      {label:"Red L2",detail:"2 kırmızı bean bag",points:2*scores.l2},
      {label:"Red L3",detail:"1 kırmızı + 1 sarı bean bag",points:2*scores.l3},
    ],
    total:2*scores.l1+2*scores.l2+2*scores.l3,
    note:"Mavi bean bag'ler kırmızı hedefte puan sayılmaz.",
    source:"fallback" as const,
  };
  const change=(key:ScoreKey,delta:number)=>{
    setCounts(current=>{
      const item=ITEMS.find(x=>x.key===key)!;
      const next=Math.max(0,Math.min(item.max,current[key]+delta));
      if(key!=="park"&&delta>0){
        const used=current.floor+current.l1+current.l2+current.l3+current.l4;
        if(used>=38)return current;
      }
      return {...current,[key]:next};
    });
  };

  return <section aria-labelledby="engage-scoring-title" className="pt-14 sm:pt-16">
    <div className="rounded-[24px] bg-[#F6F9FD] p-4 sm:p-6 lg:p-8 2xl:p-10">
      <div className="max-w-4xl">
        <p className="font-display text-[11px] font-bold tracking-[.18em] text-cyan-deep">TEKNİK DETAYLAR · {gameName.toUpperCase()}</p>
        <h2 id="engage-scoring-title" className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-ink">Puanlama Sistemi</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/60 sm:text-base sm:leading-7">Hangi hedefin kaç puan verdiğini, renk eşleşmelerini ve resmî kılavuzdaki örnek skorun nasıl oluştuğunu tek bakışta görün.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold sm:text-xs">
          <span className="rounded-full bg-[#EAF1FF] px-3 py-2 text-[#2563EB]">● 60 sn maç</span>
          <span className="rounded-full bg-[#E5F8FD] px-3 py-2 text-cyan-deep">● 6 × 8 ft saha</span>
          <span className="rounded-full bg-[#E9ECF4] px-3 py-2 text-ink">● Game Manual v{version}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {ITEMS.map(item=><article key={item.key} className="group rounded-2xl border border-[#DFE6F1] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,25,47,.08)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold" style={{background:item.tint,color:item.color}}>{item.kicker}</span>
              <div className="min-w-0"><p className="text-[10px] font-extrabold tracking-[.12em]" style={{color:item.color}}>{item.kicker}</p><h3 className="mt-1 font-display text-[15px] font-bold leading-tight text-ink sm:text-base">{item.title}</h3></div>
            </div>
            <div className="flex shrink-0 items-end gap-1"><strong className="font-display text-4xl font-bold leading-none sm:text-[42px]" style={{color:item.color}}>{scores[item.key]}</strong><span className="pb-1 text-[9px] font-bold text-ink/50">PUAN</span></div>
          </div>
          <p className="mt-5 text-[13px] leading-5 text-ink/55 sm:text-sm">{item.description}</p>
        </article>)}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.65fr_.95fr]">
        <div className="overflow-hidden rounded-[22px] bg-[#0E1738] p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-display text-xl font-bold sm:text-2xl">Hedef Seviyeleri</h3><p className="mt-1 text-xs text-white/55 sm:text-sm">Yukarı çıktıkça puan katlanarak artar.</p></div>
            <span className="rounded-full bg-[#351A3B] px-3 py-2 text-[10px] font-bold text-[#FF67B2]">● EN YÜKSEK {scores.l4} PUAN</span>
          </div>
          <div className="mt-6 space-y-2.5">
            {[ITEMS[4],ITEMS[3],ITEMS[2],ITEMS[1],ITEMS[0]].map((item,index)=>{
              const widths=[58,68,78,88,96];
              return <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_84px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_110px]">
                <div className="flex h-10 items-center justify-between rounded-lg px-3 text-xs font-bold text-white sm:px-4" style={{background:item.color,width:`${widths[index]}%`,minWidth:"7.5rem"}}><span>{item.kicker}</span><span>{scores[item.key]} PUAN</span></div>
                <span className="text-[10px] text-white/50 sm:text-xs">{item.ladderNote}</span>
              </div>;
            })}
          </div>
          <div className="mt-5 flex gap-3 rounded-xl bg-[#18254F] p-4 text-xs leading-5 text-white/80 sm:text-[13px]"><span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-brand/[.15] font-bold text-cyan-brand">i</span><p>{live?.ruleSummary.highestValue||"Bir bean bag yalnızca bir hedef için puan alır. Birden fazla hedefe uygunsa en yüksek puan değeri geçerlidir."}</p></div>
        </div>

        <div className="rounded-[22px] border border-[#DFE6F1] bg-white p-5 sm:p-7">
          <h3 className="font-display text-xl font-bold sm:text-2xl">Renk Eşleşmesi</h3>
          <p className="mt-2 text-xs leading-5 text-ink/55 sm:text-sm">Bean bag rengi, hangi hedeflerde puan alabileceğini belirler.</p>
          <div className="mt-5 space-y-3">
            {[
              {name:"Kırmızı",goal:"Kırmızı hedefler",note:"Floor, L1, L2, L3",color:"#EF4444"},
              {name:"Mavi",goal:"Mavi hedefler",note:"Floor, L1, L2, L3",color:"#2563EB"},
              {name:"Sarı",goal:"Tüm hedefler",note:"Floor, L1, L2, L3 + L4",color:"#FACC15"},
            ].map(row=><div key={row.name} className="flex items-center gap-3 rounded-xl bg-[#F4F7FB] p-3.5"><span aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full" style={{background:row.color}}/><div><b className="text-sm">{row.name}</b><p className="text-xs text-ink/60">{row.goal}</p><p className="mt-0.5 text-[10px] text-ink/45">{row.note}</p></div></div>)}
          </div>
          <div className="mt-4 rounded-xl bg-[#FFF0F7] p-4"><p className="text-[10px] font-bold tracking-[.12em] text-[#EC4899]">L4 ÖZEL KURALI</p><p className="mt-1 text-xs font-semibold leading-5 text-ink sm:text-[13px]">{live?.ruleSummary.l4||"L4 hedefinde yalnızca sarı bean bag puan kazandırır."}</p></div>
        </div>
      </div>

      {officialExample&&<div className="mt-5 overflow-hidden rounded-[22px] border border-[#DFE6F1] bg-white">
        <div className="grid gap-0 lg:grid-cols-[.75fr_1.3fr_.55fr]">
          <div className="p-5 sm:p-7">
            <p className="font-display text-[10px] font-bold tracking-[.18em] text-cyan-deep">RESMÎ PUANLAMA ÖRNEĞİ · KURAL {officialExample.ruleLabel}</p>
            <h3 className="mt-2 font-display text-2xl font-bold sm:text-[28px]">Kılavuzdaki Örnek</h3>
            <p className="mt-3 text-xs leading-5 text-ink/55 sm:text-sm sm:leading-6">RECF Game Manual içindeki örneği, puanın nasıl oluştuğunu hızlıca gösterecek biçimde sadeleştirdik.</p>
          </div>
          <div className="space-y-2.5 bg-[#F9FBFE] p-5 sm:p-7">
            {officialExample.rows.map((row,i)=><div key={`${row.label}-${i}`} className="flex items-center justify-between gap-4 rounded-xl border border-[#E6EBF3] bg-white p-3.5"><div><b className="text-xs sm:text-sm">{row.label}</b><p className="mt-1 text-[10px] text-ink/45 sm:text-xs">{row.detail}</p></div><strong className="font-display text-lg text-ink sm:text-xl">+{row.points}</strong></div>)}
            <p className="rounded-xl bg-[#FFF6E6] p-3 text-[10px] font-medium leading-4 text-[#8A5A00] sm:text-xs">{officialExample.note}</p>
          </div>
          <div className="flex min-h-48 flex-col items-center justify-center bg-[#0E1738] p-5 text-center text-white lg:min-h-full">
            <p className="font-display text-[10px] font-bold tracking-[.16em] text-white/55">ÖRNEK TOPLAM</p>
            <strong className="mt-3 font-display text-6xl font-bold leading-none sm:text-7xl">{officialExample.total}</strong>
            <p className="mt-2 text-xs font-bold text-cyan-brand">PUAN</p>
          </div>
        </div>
      </div>}

      <div className="mt-5 rounded-[22px] border border-[#DFE6F1] bg-white p-5 sm:p-7">
        <div className="grid gap-7 xl:grid-cols-[.75fr_1.2fr_.7fr] xl:items-stretch">
          <div className="self-center">
            <p className="font-display text-[10px] font-bold tracking-[.18em] text-cyan-deep">İNTERAKTİF HESAPLAMA</p>
            <h3 className="mt-2 font-display text-2xl font-bold sm:text-[28px]">Puanını Hesapla</h3>
            <p className="mt-3 text-xs leading-5 text-ink/55 sm:text-sm sm:leading-6">Hedeflerdeki bean bag sayılarını ve park eden robot sayısını değiştir. Toplam skor anında güncellenir.</p>
            <div className="mt-4 rounded-xl bg-[#E8F8FD] p-3.5 text-xs leading-5 text-ink/70"><b className="block text-[10px] tracking-[.1em] text-cyan-deep">HIZLI KURAL</b>En fazla 38 bean bag dağıtılabilir. L4 yalnız sarı bean bag kabul eder. Renk geçerliliği için yukarıdaki eşleşme kartlarını kullan.</div>
            <a href={calculatorHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-[11px] font-bold text-cyan-deep hover:underline">PUAN HESAPLAYICI ↗</a>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {ITEMS.map(item=><div key={item.key} className="flex items-center justify-between gap-2 rounded-xl bg-[#F4F7FB] p-3">
              <div className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{background:item.color}}/><div className="min-w-0"><b className="block truncate text-xs sm:text-[13px]">{item.title}</b><span className="text-[10px] text-ink/45">{scores[item.key]} puan / adet</span></div></div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={()=>change(item.key,-1)} disabled={counts[item.key]===0} aria-label={`${item.title} sayısını azalt`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white font-bold text-ink transition hover:border-cyan-brand disabled:cursor-not-allowed disabled:opacity-30">−</button>
                <output aria-label={`${item.title} adedi`} className="min-w-7 text-center font-display text-sm font-bold">{counts[item.key]}</output>
                <button type="button" onClick={()=>change(item.key,1)} disabled={counts[item.key]>=item.max||(item.key!=="park"&&bagCount>=38)} aria-label={`${item.title} sayısını artır`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white font-bold text-ink transition hover:border-cyan-brand disabled:cursor-not-allowed disabled:opacity-30">+</button>
              </div>
            </div>)}
          </div>

          <div className="flex min-h-56 flex-col items-center justify-center rounded-[18px] bg-[#0E1738] p-5 text-center text-white">
            <p className="font-display text-[10px] font-bold tracking-[.16em] text-white/55">TOPLAM SKOR</p>
            <output aria-live="polite" className="mt-3 font-display text-6xl font-bold leading-none sm:text-7xl">{total}</output>
            <p className="mt-2 text-xs font-bold text-cyan-brand">PUAN</p>
            <p className="mt-4 text-[10px] leading-4 text-white/45">{bagCount}/38 bean bag · {counts.park}/2 park</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={()=>setCounts(OFFICIAL_INITIAL)} className="rounded-lg border border-cyan-brand/40 px-3 py-2 text-[10px] font-bold text-cyan-brand hover:border-cyan-brand">KILAVUZ ÖRNEĞİ</button>
              <button type="button" onClick={()=>setCounts(ZERO)} className="rounded-lg border border-white/20 px-3 py-2 text-[10px] font-bold text-white/75 hover:border-cyan-brand hover:text-white">SIFIRLA</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#E9EDF5] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.12em] text-ink">KURALLAR VE ARAÇLAR</p>
          <p className="mt-1 text-xs leading-5 text-ink/60 sm:text-sm">Detaylı oyun kuralları, soru-cevaplar ve puan hesaplama araçlarına ulaşın.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={qnaHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-bold text-ink transition hover:border-cyan-brand">Q&A ↗</a>
          <a href={calculatorHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-bold text-ink transition hover:border-cyan-brand">PUAN HESAPLAYICI ↗</a>
          <a href={sourceHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink-soft">OYUN KILAVUZU ↗</a>
        </div>
      </div>
    </div>
  </section>;
}
