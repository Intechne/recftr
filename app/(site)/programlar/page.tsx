import Link from "next/link";
import type { Metadata } from "next";
import { programs } from "@/lib/data";
import { PageHead } from "@/components/Ui";
import { Reveal } from "@/components/Motion";

export const metadata: Metadata = { title: "Programlar" };

export default function ProgramlarPage() {
  return (
    <div className="pb-20">
      <PageHead kicker="PROGRAMLAR" title="5 RESMİ PROGRAM" sub="Yaşa ve seviyeye göre doğru arenayı seç — karadan gökyüzüne." />
      <div className="mx-auto max-w-7xl space-y-5 px-5 lg:px-10">
        {programs.map((p, i) => (
          <Reveal key={p.slug} delay={i * 60}>
            <div className="plate-hover flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate lg:flex-row lg:items-center"
              style={{ ["--tw-shadow-color" as string]: p.hex }}>
              <div className={`flex h-24 items-center justify-center lg:h-[140px] lg:w-[150px] lg:shrink-0 ${p.color}`}>
                <span className={`font-display text-[40px] font-bold ${p.text}`}>{p.code}</span>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="font-display text-[11px] font-medium tracking-[1.5px]" style={{ color: p.hex === "#10192F" ? "#5a6a90" : p.hex }}>
                  {p.ageDetail.toUpperCase()}
                </p>
                <h2 className="mt-1 font-display text-[23px] font-bold text-ink">{p.name}</h2>
                <p className="mt-1.5 max-w-3xl text-[14.5px] leading-relaxed text-ink/55">
                  2026–27 oyunu &quot;{p.game}&quot;: {p.short}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.chips.slice(0, 4).map((c) => (
                    <span key={c} className="rounded border border-ink/15 bg-paper px-2.5 py-1.5 font-display text-[10.5px] font-semibold text-ink">{c}</span>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-5 lg:pb-0 lg:pr-7">
                <Link href={`/programlar/${p.slug}`} className="inline-block rounded-md bg-ink px-5 py-3 font-display text-[13px] font-bold text-white transition-colors hover:bg-cyan-deep">
                  PROGRAMA GİR
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
