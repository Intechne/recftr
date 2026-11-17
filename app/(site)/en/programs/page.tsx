import Link from "next/link";
import type { Metadata } from "next";
import { abs, pageMeta } from "@/lib/seo";
import { languageAlternates } from "@/lib/i18n";
import { PROGRAMS_EN } from "@/lib/programs-en";
import { RECF_EVENTS_URL, SEASON } from "@/lib/site-config";
import { copy } from "@/lib/copy";
import { FigmaIcon } from "@/components/FigmaIcon";
import { badgeTextColor } from "@/lib/color";
import RecfEventsLink from "@/components/analytics/RecfEventsLink";

export const metadata: Metadata = pageMeta({ title: "Programs — RECF Türkiye", description: "RECF Engage, RECF Achieve, RECF Inspire, Aerial Drone Competition and ADC Pro: season games, age groups and official RECF game manuals.", path: "/en/programs", lang: "en", languages: languageAlternates("/programlar", "/en/programs", abs) });

const COLORS: Record<string, string> = { engage: "#29B9E5", achieve: "#1E8CD9", inspire: "#10192F", adc: "#8DC63F", "adc-pro": "#93268F" };

export default function EnglishPrograms() {
  return <div className="pb-20">
    <section className="field-grid border-b-2 border-ink">
      <div className="safe-x mx-auto max-w-7xl py-12 lg:px-10 lg:py-16">
        <p className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 font-display text-xs font-bold tracking-[1.5px] text-cyan-brand"><FigmaIcon name="programs" className="h-4 w-4" /> PROGRAMS · {SEASON}</p>
        <h1 className="mt-5 font-display text-[clamp(2.3rem,8vw,4.25rem)] font-bold leading-[.98]">FIVE PROGRAMS.<br /><span className="text-cyan-deep">ONE SEASON PATHWAY.</span></h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink/65">Choose the program that fits your students. Game rules are defined by RECF&apos;s official manuals; registration is completed on RECFEvents.org.</p>
      </div>
    </section>
    <div className="safe-x mx-auto grid max-w-7xl gap-4 py-12 md:grid-cols-2 lg:px-10 xl:grid-cols-3">
      {PROGRAMS_EN.map(program => <article key={program.slug} className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white">
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: COLORS[program.slug], color: badgeTextColor(COLORS[program.slug]) }}><span className="font-display text-[28px] font-bold">{program.code}</span><span className="font-display text-[12px] font-bold tracking-[1px]">{program.fee} / TEAM</span></div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="font-display text-[20px] font-bold">{program.name}</h2>
          <p className="mt-1 font-display text-[13px] font-semibold text-cyan-deep">Season game: {program.game}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{program.summary}</p>
          <dl className="mt-4 text-[13.5px]"><dt className="font-bold">Eligibility</dt><dd className="text-ink/70">{program.ages}</dd>{program.team&&<><dt className="mt-2 font-bold">Team size</dt><dd className="text-ink/70">{program.team}</dd></>}</dl>
          <div className="mt-auto flex flex-wrap gap-3 pt-5"><a href={program.manual} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border-2 border-ink px-3.5 py-2 font-display text-[12px] font-bold">OFFICIAL GAME MANUAL ↗<span className="sr-only"> (opens in a new tab)</span></a><Link href={`/programlar/${program.slug}`} lang="tr" className="inline-flex min-h-11 items-center px-1 font-display text-[12px] font-bold text-cyan-deep">DETAILS (TR) →</Link></div>
        </div>
      </article>)}
    </div>
    <div className="safe-x mx-auto flex max-w-7xl flex-col gap-4 rounded-xl bg-ink px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-10">
      <p className="font-display text-[18px] font-bold text-white">Ready to start?</p>
      <div className="flex flex-col gap-3 min-[460px]:flex-row"><RecfEventsLink href={RECF_EVENTS_URL} placement="en-programs" className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink">{copy("en").officialRegistration} ↗</RecfEventsLink><Link href="/kayit" lang="tr" className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-white/40 px-5 py-3 font-display text-[13px] font-bold text-white">{copy("en").apply} (TR)</Link></div>
    </div>
  </div>;
}
