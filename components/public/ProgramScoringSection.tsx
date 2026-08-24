import type {OfficialProgramData} from "@/lib/recf-games";

type Props={official:OfficialProgramData|null|undefined};

export function ProgramScoringSection({official}:Props){
  if(!official||official.scoringGroups.length===0)return null;
  return <section aria-labelledby="program-scoring-title" className="pt-14 sm:pt-16">
    <div className="rounded-[24px] bg-[#F6F9FD] p-4 sm:p-6 lg:p-8 2xl:p-10">
      <div className="max-w-4xl">
        <p className="font-display text-[11px] font-bold tracking-[.18em] text-cyan-deep">TEKNİK DETAYLAR · {official.gameName.toUpperCase()}</p>
        <h2 id="program-scoring-title" className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-none text-ink">Puanlama Sistemi</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/60 sm:text-base sm:leading-7">Oyundaki temel puan kalemlerini ve örnek hesaplamaları hızlıca inceleyin.</p>
        {official.versionLabel&&<div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold sm:text-xs"><span className="rounded-full bg-[#E9ECF4] px-3 py-2 text-ink">2026–27 · Game Manual v{official.versionLabel}</span></div>}
      </div>

      <div className="mt-8 space-y-6">
        {official.scoringGroups.map(group=><div key={group.id} className="rounded-[20px] border border-[#DFE6F1] bg-white p-4 sm:p-6">
          <div className="max-w-3xl"><h3 className="font-display text-xl font-bold text-ink sm:text-2xl">{group.title}</h3><p className="mt-2 text-xs leading-5 text-ink/55 sm:text-sm">{group.subtitle}</p></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map(entry=><article key={entry.key} className="rounded-2xl border border-[#E3E8F2] bg-[#FBFCFE] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4"><span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full mt-1.5" style={{background:entry.color}}/><strong className="text-right font-display text-xl font-bold leading-tight sm:text-2xl" style={{color:entry.color}}>{entry.points}</strong></div>
              <h4 className="mt-3 font-display text-sm font-bold text-ink sm:text-base">{entry.label}</h4>
              <p className="mt-2 text-xs leading-5 text-ink/55 sm:text-[13px]">{entry.description}</p>
            </article>)}
          </div>
        </div>)}
      </div>

      {official.examples.length>0&&<div className="mt-6">
        <div className="mb-4"><p className="font-display text-[10px] font-bold tracking-[.16em] text-cyan-deep">PUANLAMA ÖRNEKLERİ</p><h3 className="mt-2 font-display text-2xl font-bold text-ink">Skor Nasıl Oluşuyor?</h3></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {official.examples.map((example,index)=><article key={`${example.ruleLabel}-${index}`} className="overflow-hidden rounded-[20px] border border-[#DFE6F1] bg-white">
            <div className="p-5 sm:p-6"><p className="text-[10px] font-bold tracking-[.12em] text-cyan-deep">KURAL {example.ruleLabel}</p><h4 className="mt-2 font-display text-lg font-bold sm:text-xl">{example.title}</h4><div className="mt-4 space-y-2">{example.rows.map((row,i)=><div key={`${row.label}-${i}`} className="flex items-center justify-between gap-4 rounded-xl bg-[#F4F7FB] p-3"><div><b className="text-xs sm:text-sm">{row.label}</b><p className="mt-0.5 text-[10px] text-ink/45 sm:text-xs">{row.detail}</p></div><strong className="font-display text-base text-ink sm:text-lg">{row.points}</strong></div>)}</div>{example.note&&<p className="mt-3 rounded-xl bg-[#FFF6E6] p-3 text-[10px] font-medium leading-4 text-[#8A5A00] sm:text-xs">{example.note}</p>}</div>
            <div className="flex items-center justify-between gap-4 bg-[#0E1738] px-5 py-4 text-white sm:px-6"><span className="text-[10px] font-bold tracking-[.12em] text-white/55">TOPLAM / SONUÇ</span><strong className="font-display text-2xl font-bold text-cyan-brand">{example.total}</strong></div>
          </article>)}
        </div>
      </div>}

      <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[#E9EDF5] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="text-[10px] font-bold tracking-[.12em] text-ink">KURALLAR VE ARAÇLAR</p><p className="mt-1 text-xs leading-5 text-ink/60 sm:text-sm">Detaylı oyun kuralları, soru-cevaplar ve puan hesaplama araçlarına ulaşın.</p></div>
        <div className="flex flex-wrap gap-2">
          {official.qnaUrl&&<a href={official.qnaUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-bold text-ink transition hover:border-cyan-brand">Q&A ↗</a>}
          {official.calculatorUrl&&<a href={official.calculatorUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-bold text-ink transition hover:border-cyan-brand">PUAN HESAPLAYICI ↗</a>}
          {official.manualUrl&&<a href={official.manualUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink-soft">OYUN KILAVUZU ↗</a>}
        </div>
      </div>
    </div>
  </section>;
}
