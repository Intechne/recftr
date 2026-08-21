import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { programs, programBySlug, events } from "@/lib/data";
import { CodeBadge, StatusPill, Photo } from "@/components/Ui";
import { Reveal } from "@/components/Motion";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = programBySlug(slug);
  return { title: p ? `${p.name} — "${p.game}"` : "Program" };
}

/* Engage puan katmanları grafiği */
function EngageTiers({ facts }: { facts: { label: string; value: string }[] }) {
  const heights = [60, 100, 140, 190, 240, 120];
  const colors = ["#ccd3e0", "#99d1ed", "#29B9E5", "#1E8CD9", "#10192F", "#8DC63F"];
  return (
    <div>
      <h2 className="font-display text-[26px] font-bold text-ink lg:text-[30px]">PUANLAMA — KATMANLI HEDEFLER</h2>
      <div className="mt-8 flex items-end gap-3 overflow-x-auto pb-2 lg:gap-4">
        {facts.map((f, i) => (
          <div key={f.label} className="flex min-w-[86px] flex-1 flex-col items-center">
            <div className="w-full rounded-lg" style={{ height: heights[i], backgroundColor: colors[i] }} />
            <p className="mt-2.5 font-display text-[15px] font-bold text-ink">{f.value.toUpperCase()}</p>
            <p className="text-center font-display text-[10.5px] font-medium text-ink/50">{f.label.toUpperCase()}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 max-w-4xl text-[13.5px] text-ink/55">
        Bean bag&apos;ler yükseldikçe puan artar; en üst katman yalnızca sarı bean bag&apos;lere açıktır.
        Maç sonunda robotun park etmesi 25 puan kazandırır.
      </p>
    </div>
  );
}

/* Achieve/Inspire VS şeması */
function VsDiagram({ auto }: { auto: string }) {
  return (
    <div>
      <h2 className="font-display text-[26px] font-bold text-ink lg:text-[30px]">İTTİFAK MAÇI FORMATI</h2>
      <div className="mt-6 flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white sm:flex-row">
        <div className="flex flex-1 flex-col items-center gap-1.5 bg-alliance-red/10 py-7">
          <span className="font-display text-[15px] font-bold text-alliance-red">KIRMIZI İTTİFAK</span>
          <span className="font-display text-[22px] font-bold text-ink">TAKIM A + TAKIM B</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 bg-ink px-8 py-5">
          <span className="font-display text-[30px] font-bold text-cyan-brand">VS</span>
          <span className="text-center font-display text-[12px] font-medium leading-relaxed text-white">{auto} OTONOM<br />{auto === "0:15" ? "1:45" : "1:30"} SÜRÜCÜ</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5 bg-alliance-blue/10 py-7">
          <span className="font-display text-[15px] font-bold text-alliance-blue">MAVİ İTTİFAK</span>
          <span className="font-display text-[22px] font-bold text-ink">TAKIM C + TAKIM D</span>
        </div>
      </div>
    </div>
  );
}

/* Inspire çift robot görseli */
function DualRobot() {
  return (
    <div className="rounded-xl border-[3px] border-cyan-brand bg-white p-7 shadow-plate shadow-cyan-brand/40">
      <p className="text-center font-display text-[20px] font-bold text-ink">1 TAKIM = 2 ROBOT</p>
      <div className="mt-5 flex items-center justify-center gap-5">
        <span className="flex h-28 w-28 flex-col items-center justify-center rounded-xl bg-ink font-display text-[15px] font-bold text-white">🤖<span className="mt-1">ROBOT A</span></span>
        <span className="font-display text-4xl font-bold text-cyan-brand">+</span>
        <span className="flex h-28 w-28 flex-col items-center justify-center rounded-xl bg-cyan-brand font-display text-[15px] font-bold text-ink">🤖<span className="mt-1">ROBOT B</span></span>
      </div>
      <p className="mt-4 text-center text-[12.5px] text-ink/55">Birlikte çalışacak şekilde tasarlanır — görev paylaşımı stratejinin kalbidir.</p>
    </div>
  );
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = programBySlug(slug);
  if (!p) notFound();
  const related = events.filter((e) => e.program === p.slug);
  const isVs = p.slug === "achieve" || p.slug === "inspire";

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="field-grid-dark relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute -top-24 right-[-6rem] h-56 w-56 rotate-45" style={{ backgroundColor: p.hex === "#10192F" ? "#ffffffE6" : p.hex }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.2fr_1fr] lg:px-10">
          <div>
            <p className="font-display text-[12px] font-semibold tracking-[2px] text-cyan-brand">
              <Link href="/programlar" className="hover:underline">PROGRAMLAR</Link> / {p.code}
            </p>
            <h1 className="mt-4 font-display text-5xl font-bold text-white lg:text-[64px]">{p.name.toUpperCase()}</h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">{p.long.split(". ").slice(0, 2).join(". ")}.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {p.chips.map((c) => (
                <span key={c} className="rounded border border-white/20 bg-white/[.08] px-3 py-1.5 font-display text-[12px] font-medium text-white">{c}</span>
              ))}
            </div>
            <Link href="/kayit" className="plate-hover mt-7 inline-block rounded-md bg-cyan-brand px-6 py-3.5 font-display text-[15px] font-bold text-ink shadow-plateSm shadow-white/25">
              BU PROGRAMA KAYDOL
            </Link>
          </div>
          <Reveal>
            <div className="overflow-hidden rounded-xl border-[3px] border-cyan-brand bg-white shadow-plate shadow-cyan-brand/40">
              <div className="bg-ink px-4.5 px-4 py-3 font-display text-[13px] font-bold text-cyan-brand">SEZON OYUNU 26–27</div>
              <Photo label={`${p.game} saha görseli`} tone="from-[#4c7a94] to-[#1a3352]" className="m-5 h-44 rounded-lg" />
              <p className="px-5 font-display text-[22px] font-bold text-ink">&quot;{p.game.toUpperCase()}&quot;</p>
              <Link href="/dokumanlar" className="block px-5 pb-5 pt-2 font-display text-[13px] font-semibold text-cyan-deep hover:underline">
                OYUN KILAVUZUNU İNDİR (PDF) ↓
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Maç türleri */}
      <section className="mx-auto max-w-7xl px-5 pt-14 lg:px-10">
        <h2 className="font-display text-[26px] font-bold text-ink lg:text-[30px]">MAÇ TÜRLERİ</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.matchTypes.map((m, i) => (
            <Reveal key={m.title} delay={i * 70}>
              <div className="h-full rounded-xl border-[1.5px] border-ink/20 bg-white p-5">
                <span className="text-2xl" aria-hidden>{m.icon}</span>
                <h3 className="mt-2 font-display text-[15px] font-bold text-ink">{m.title.toUpperCase()}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink/55">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Programa özel bölüm */}
      <section className="mx-auto max-w-7xl px-5 pt-14 lg:px-10">
        {p.slug === "engage" && <EngageTiers facts={p.facts} />}
        {isVs && (
          <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
            <VsDiagram auto={p.slug === "achieve" ? "0:15" : "0:30"} />
            {p.slug === "inspire" ? <DualRobot /> : (
              <div className="rounded-xl border-2 border-ink bg-white p-6">
                <h3 className="font-display text-[16px] font-bold text-ink">ROBOT KURALLARI (RESMİ)</h3>
                <ul className="mt-3.5 space-y-2.5">
                  {p.facts.map((f) => (
                    <li key={f.label} className="flex justify-between gap-4 border-b border-ink/8 pb-2.5 text-[14px]">
                      <span className="text-ink/55">{f.label}</span>
                      <span className="text-right font-semibold text-ink">{f.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {(p.slug === "adc" || p.slug === "adc-pro") && (
          <div>
            <h2 className="font-display text-[26px] font-bold text-ink lg:text-[30px]">PROGRAM DETAYLARI</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.facts.map((f) => (
                <div key={f.label} className="rounded-xl border-[1.5px] border-ink/20 bg-white p-5">
                  <p className="font-display text-[11px] font-medium tracking-[1.5px] text-ink/45">{f.label.toUpperCase()}</p>
                  <p className="mt-1.5 font-display text-[17px] font-bold text-ink">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {p.slug === "inspire" && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.facts.map((f) => (
              <div key={f.label} className="rounded-xl border-[1.5px] border-ink/20 bg-white p-5">
                <p className="font-display text-[11px] font-medium tracking-[1.5px] text-ink/45">{f.label.toUpperCase()}</p>
                <p className="mt-1.5 font-display text-[16px] font-bold text-ink">{f.value}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-6 text-[13px] text-ink/45">Kaynak: {p.source}</p>
      </section>

      {/* Bu programın etkinlikleri */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-14 lg:px-10">
          <h2 className="font-display text-[26px] font-bold text-ink">BU PROGRAMIN ETKİNLİKLERİ</h2>
          <div className="mt-6 space-y-3.5">
            {related.map((e) => (
              <Link key={e.slug} href={`/etkinlikler/${e.slug}`}
                className="flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] bg-white px-5 py-4 transition-colors hover:bg-cyan-brand/5"
                style={{ borderColor: p.hex, borderLeftWidth: 5 }}>
                <span className="font-display text-[26px] font-bold text-ink">{e.date.split(" ")[0]}</span>
                <span className="font-display text-[12px] font-semibold text-ink/50">{e.date.split(" ").slice(1).join(" ").toUpperCase()}</span>
                <span className="min-w-0 flex-1 font-semibold text-ink">{e.name} <span className="font-normal text-ink/50">· {e.venue}</span></span>
                <StatusPill status={e.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Doküman şeridi */}
      <section className="mx-auto max-w-7xl px-5 pt-14 lg:px-10">
        <div className="flex flex-wrap gap-3.5">
          {[`${p.game} Oyun Kılavuzu`, "Genel Kural Kitabı 26–27", "Saha Çizimleri", "Mühendislik Defteri Şablonu"].map((d) => (
            <Link key={d} href="/dokumanlar" className="flex items-center gap-3 rounded-lg bg-ink px-4.5 px-4 py-3.5 transition-colors hover:bg-ink-soft">
              <span className="rounded bg-cyan-brand px-2 py-1 font-display text-[11px] font-bold text-ink">PDF</span>
              <span className="font-display text-[14px] font-semibold text-white">{d}</span>
              <span className="text-[11px] text-white/50">indir ↓</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
