import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { events, eventBySlug, programs } from "@/lib/data";
import EventTabs from "./EventTabs";
import { getEvent } from "@/lib/db";

export const dynamicParams = true;
export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = eventBySlug(slug);
  return { title: e ? `${e.name} — Etkinlik Hakkında` : "Etkinlik" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = eventBySlug(slug);
  if (!e) {
    const d = await getEvent(slug);
    if (!d) notFound();
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-display text-[13px] font-semibold tracking-[2px] text-cyan-deep">⬡ {d.code} · {d.status}</p>
        <h1 className="mt-2 font-display text-[36px] font-bold text-ink">{String(d.title).toUpperCase()}</h1>
        <p className="mt-3 text-[15.5px] text-ink/65">{d.excerpt}</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {[["TARİH", d.date_label], ["ŞEHİR", d.city], ["MEKAN", d.venue || "Açıklanacak"], ["KONTENJAN", `${d.registered}/${d.capacity} takım`]].map(([t, v]) => (
            <div key={t as string} className="rounded-xl border-2 border-ink bg-white p-4 shadow-plateSm shadow-cyan-brand">
              <p className="font-display text-[10.5px] font-semibold tracking-[1.5px] text-ink/50">{t}</p>
              <p className="mt-1 font-display text-[16px] font-bold text-ink">{v}</p>
            </div>
          ))}
        </div>
        <Link href="/kayit" className="plate-hover mt-8 inline-block rounded-md bg-ink px-6 py-3.5 font-display text-[14px] font-bold text-white shadow-plateSm shadow-cyan-brand">TAKIMINI KAYDET →</Link>
        <p className="mt-6 text-[13px] text-ink/50">Detaylı ajanda ve saha planı etkinlik tarihinden 2 hafta önce yayınlanır.</p>
      </div>
    );
  }
  const p = programs.find((x) => x.slug === e.program)!;
  const cta = e.status === "open" ? "TAKIMINI KAYDET" : e.status === "full" ? "YEDEK LİSTEYE YAZIL" : "HABERDAR OL";

  return (
    <div>
      {/* Etkinlik hero */}
      <section className="field-grid-dark relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute -top-20 right-[-5rem] h-44 w-44 rotate-45" style={{ backgroundColor: p.hex === "#10192F" ? "#ffffffE6" : p.hex }} />
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-10">
          <p className="font-display text-[12px] font-semibold tracking-[2px] text-cyan-brand">
            <Link href="/etkinlikler" className="hover:underline">ETKİNLİKLER</Link> / {e.code} · ETKİNLİK HAKKINDA
          </p>
          <h1 className="mt-3.5 font-display text-4xl font-bold text-white lg:text-[46px]">{e.name.toUpperCase()}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold text-white/70">
            <span>📅 {e.date} · {e.time}</span>
            <span>📍 {e.venue}, {e.city}</span>
            <span>🏷 {p.name}</span>
            <span>👥 {e.status === "soon" ? "Kontenjan açıklanacak" : `${e.capacity} Takım${e.status === "full" ? " (DOLU)" : ""}`}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/kayit" className="plate-hover rounded-md bg-cyan-brand px-5 py-3 font-display text-[14px] font-bold text-ink shadow-plateSm shadow-white/20">{cta}</Link>
            <Link href="/dokumanlar" className="rounded-md border-[1.5px] border-white/40 px-5 py-3 font-display text-[14px] font-semibold text-white transition-colors hover:border-white">ETKİNLİK KİTAPÇIĞI (PDF)</Link>
          </div>
        </div>
      </section>
      <EventTabs event={e} />
    </div>
  );
}
