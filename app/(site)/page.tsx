import Link from "next/link";
import { programs, events, stats, news } from "@/lib/data";
import { CodeBadge, StatusPill, BtnPrimary, BtnGhost, SectionHead, Photo } from "@/components/Ui";
import { Reveal, CountUp, RoutePath } from "@/components/Motion";

const waypoints = [
  { m: "EYL", label: "Kayıtlar", done: true, pos: "left-[1%]" },
  { m: "EKİ", label: "İl Etkinlikleri", done: true, pos: "left-[22%]" },
  { m: "ARA", label: "Bölge Turnuvaları", done: false, pos: "left-[46%]" },
  { m: "ŞUB", label: "Türkiye Şampiyonası", done: false, pos: "left-[70%]" },
  { m: "NİS", label: "Dünya Şampiyonası", done: false, pos: "left-[92%]" },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="field-grid relative overflow-hidden">
        <div aria-hidden className="absolute -left-24 bottom-8 h-40 w-40 rotate-45 bg-alliance-red/90" />
        <div aria-hidden className="absolute -top-24 right-[-6rem] h-56 w-56 rotate-45 bg-alliance-blue/90" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.15fr_1fr] lg:px-10 lg:py-24">
          <div>
            <span className="rise rise-1 inline-flex items-center rounded bg-ink px-3.5 py-2 font-display text-[12px] font-semibold tracking-[1.5px] text-cyan-brand">
              ⬡ RESMİ RECF ULUSLARARASI PARTNERİ
            </span>
            <h1 className="mt-6 font-display font-bold leading-[0.98]">
              <span className="rise rise-2 block text-[56px] text-ink lg:text-[92px]">MAÇ GÜNÜ</span>
              <span className="rise rise-3 block text-[56px] text-cyan-brand lg:text-[92px]" style={{ WebkitTextStroke: "2px #10192F" }}>
                HER GÜN.
              </span>
            </h1>
            <p className="rise rise-4 mt-6 max-w-xl text-[17px] leading-relaxed text-ink/60 lg:text-[18px]">
              Türkiye&apos;nin resmi RECF robotik ve drone programları. Takım numaranı al,
              programını seç, dünya şampiyonasına giden yolculuğa başla.
            </p>
            <div className="rise rise-4 mt-8 flex flex-wrap gap-3.5">
              <BtnPrimary href="/kayit" dark>TAKIM NUMARANI AL</BtnPrimary>
              <BtnGhost href="/programlar">PROGRAMLARI GÖR</BtnGhost>
            </div>
          </div>

          {/* Sezon Oyunları kartı */}
          <Reveal>
            <div className="overflow-hidden rounded-2xl bg-ink shadow-[0_24px_60px_rgba(6,12,26,.35)]">
              <div className="flex items-center justify-between bg-white/5 px-5 py-4">
                <span className="font-display text-[15px] font-bold text-cyan-brand">SEZON OYUNLARI 2026–27</span>
                <span className="rounded-[3px] bg-cyan-brand px-2.5 py-1 font-display text-[11px] font-bold text-ink">YENİ</span>
              </div>
              <div className="px-2 py-2">
                {programs.map((p) => (
                  <Link key={p.slug} href={`/programlar/${p.slug}`}
                    className="group flex items-center gap-3.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5">
                    <span className={`flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md font-display text-sm font-bold ${p.color} ${p.text}`}>{p.code}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[17px] font-bold text-white">&quot;{p.game.replace(" (Üniversite)", " · Üni")}&quot;</span>
                      <span className="block truncate text-[12px] text-white/50">{p.age} · {p.short.split(".")[0]}.</span>
                    </span>
                    <span className="font-display text-cyan-brand transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                ))}
              </div>
              <p className="px-5 pb-4 text-[12px] text-white/40">Resmi oyun kılavuzları <Link href="/dokumanlar" className="underline hover:text-cyan-brand">Dokümanlar</Link> sayfasında</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PROGRAM PLAKALARI ────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-3xl font-bold leading-tight text-ink lg:text-[44px]">
              5 PROGRAM. TEK NUMARA:<br />SENİN TAKIMININ.
            </h2>
            <p className="max-w-xs text-right text-[15px] leading-relaxed text-ink/50">
              Her takım bir plaka alır. Plakan, ilk maçından dünya şampiyonasına kadar seninle.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {programs.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link href={`/programlar/${p.slug}`}
                  className="plate-hover block h-full overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate"
                  style={{ ["--tw-shadow-color" as string]: p.hex }}>
                  <div className={`flex items-center justify-between px-4.5 p-4 ${p.color}`}>
                    <span className={`font-display text-[32px] font-bold ${p.text}`}>{p.code}</span>
                    <span className={`font-display text-xl opacity-50 ${p.text}`} aria-hidden>⬡</span>
                  </div>
                  <div className="p-4.5 p-4">
                    <p className="font-display text-[11px] font-medium tracking-[1.5px]" style={{ color: p.hex === "#10192F" ? "#4a5a80" : p.hex }}>{p.age}</p>
                    <h3 className="mt-1.5 font-display text-[20px] font-bold text-ink">{p.name.replace("RECF ", "")}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink/55">&quot;{p.game}&quot; — {p.short.split(".")[0]}.</p>
                    <p className="mt-3 font-display text-[13px] font-semibold text-ink">PROGRAMA GİR →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEZON ROTASI ─────────────────────────────── */}
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
          <h2 className="font-display text-[26px] font-bold text-ink lg:text-[34px]">SEZON ROTASI <span className="text-cyan-deep">2026–27</span></h2>
          <div className="relative mt-8 hidden lg:block">
            <RoutePath />
            <span aria-hidden className="absolute left-[38%] top-[52%] -rotate-12 text-[28px] text-adc">✈</span>
            <div className="relative mt-2 h-24">
              {waypoints.map((wp) => (
                <div key={wp.m} className={`absolute ${wp.pos} flex -translate-x-1/2 flex-col items-center`}>
                  <span className={`diamond h-5 w-5 rounded border-[2.5px] border-ink ${wp.done ? "bg-cyan-brand" : "bg-white"}`} />
                  <span className={`mt-2.5 font-display text-sm font-bold ${wp.done ? "text-cyan-deep" : "text-ink"}`}>{wp.m}</span>
                  <span className="text-[13px] text-ink/55">{wp.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Mobil dikey rota */}
          <ol className="mt-8 space-y-5 border-l-2 border-dashed border-ink/30 pl-6 lg:hidden">
            {waypoints.map((wp) => (
              <li key={wp.m} className="relative">
                <span className={`diamond absolute -left-[33px] top-1 h-4 w-4 rounded border-2 border-ink ${wp.done ? "bg-cyan-brand" : "bg-white"}`} />
                <span className="font-display text-sm font-bold text-ink">{wp.m}</span>
                <span className="ml-2 text-[14px] text-ink/60">{wp.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── İSTATİSTİK BANDI ─────────────────────────── */}
      <section className="bg-ink">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-11 sm:grid-cols-3 lg:grid-cols-5 lg:px-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-[38px] font-bold text-cyan-brand lg:text-[46px]">
                <CountUp to={s.num} suffix={s.suffix} />
              </p>
              <p className="mt-1 font-display text-[11px] font-medium tracking-[2px] text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── YAKLAŞAN ETKİNLİKLER ─────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
          <SectionHead title="YAKLAŞAN ETKİNLİKLER" action="TÜM ETKİNLİKLER" actionHref="/etkinlikler" />
          <div className="overflow-hidden rounded-xl border-2 border-ink">
            <div className="hidden bg-ink px-6 py-3.5 font-display text-[12px] font-semibold tracking-[1.5px] text-white/50 lg:grid lg:grid-cols-[110px_90px_1fr_240px_150px]">
              <span>TARİH</span><span>PROGRAM</span><span>ETKİNLİK</span><span>KONUM</span><span>DURUM</span>
            </div>
            {events.slice(0, 6).map((e, i) => {
              const p = programs.find((x) => x.slug === e.program)!;
              return (
                <Link key={e.slug} href={`/etkinlikler/${e.slug}`}
                  className={`grid items-center gap-2 px-6 py-4 transition-colors hover:bg-cyan-brand/5 lg:grid-cols-[110px_90px_1fr_240px_150px] ${i % 2 ? "bg-paper/60" : "bg-white"}`}>
                  <span className="font-display text-[16px] font-bold text-ink">{e.date.split(" ").slice(0, 2).join(" ").toUpperCase()}</span>
                  <span><CodeBadge code={p.code} hex={p.hex} /></span>
                  <span className="font-semibold text-ink">{e.name}</span>
                  <span className="text-[15px] text-ink/55">{e.venue}</span>
                  <span><StatusPill status={e.status} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SON HABERLER ─────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
          <SectionHead title="DUYURULAR & HABERLER" action="TÜM HABERLER" actionHref="/duyurular" />
          <div className="grid gap-5 md:grid-cols-3">
            {news.slice(0, 3).map((n, i) => (
              <Reveal key={n.slug} delay={i * 80}>
                <Link href={`/duyurular/${n.slug}`} className="block h-full overflow-hidden rounded-xl border border-ink/20 bg-white transition-shadow hover:shadow-lg">
                  <Photo label={n.title.slice(0, 34) + "…"} tone="from-[#2e4780] to-ink" className="h-36" />
                  <div className="p-5">
                    <span className="rounded bg-cyan-brand/15 px-2 py-1 font-display text-[10px] font-bold tracking-wider text-cyan-deep">{n.tag}</span>
                    <h3 className="mt-2.5 font-semibold leading-snug text-ink">{n.title}</h3>
                    <p className="mt-2.5 font-display text-[11px] font-medium tracking-wider text-ink/45">{n.date.toUpperCase()}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERİ ───────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
          <SectionHead title="SAHADAN — ETKİNLİK GALERİSİ" action="TÜM GALERİ" actionHref="/duyurular" />
          <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="group relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-gradient-to-br from-[#2e3d66] to-[#0c1426] lg:min-h-[400px]">
              <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-cyan-brand text-2xl text-ink shadow-[0_8px_30px_rgba(41,185,229,.5)] transition-transform group-hover:scale-110" aria-hidden>▶</span>
              <span className="absolute bottom-4 left-4 rounded bg-ink/85 px-3 py-1.5 font-display text-[13px] font-semibold text-white">🎬 2025–26 Sezon Özeti · 2:14</span>
            </div>
            <div className="grid gap-4">
              <Photo label="Kupa töreni — İstanbul Şampiyonası" tone="from-[#bf7f59] to-ink" className="min-h-[145px] border-2 border-ink" />
              <Photo label="Pit alanında son ayarlar" tone="from-[#598ca6] to-ink" className="min-h-[145px] border-2 border-ink" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Photo label="Drone uçuş anı" tone="from-[#7f5999] to-ink" className="h-44" accent="#93268F" />
            <Photo label="ADC saha kurulumu" tone="from-[#4c8059] to-ink" className="h-44" accent="#8DC63F" />
            <Photo label="İttifak seçimi heyecanı" tone="from-[#99594c] to-ink" className="h-44" accent="#E5303E" />
            <Photo label="Mühendislik defteri sunumu" tone="from-[#4c6699] to-ink" className="h-44" accent="#29B9E5" />
          </div>
        </div>
      </section>

      {/* ── PLAKA CTA ────────────────────────────────── */}
      <section className="field-grid-dark relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute -left-20 -top-20 h-44 w-44 rotate-45 bg-alliance-red" />
        <div aria-hidden className="absolute -bottom-20 -right-20 h-44 w-44 rotate-45 bg-alliance-blue" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <h2 className="font-display text-4xl font-bold leading-[1.06] text-white lg:text-[56px]">PLAKAN HAZIR.<br />SAHAYA ÇIK.</h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/65">
              Takım numaranı al, sezonun ilk etkinliğine kaydol. Okul, kulüp veya bağımsız
              topluluk — 2 dakikada başvuru, 24 saatte onay.
            </p>
            <div className="mt-8">
              <BtnPrimary href="/kayit">TAKIM KAYDINA BAŞLA</BtnPrimary>
            </div>
          </div>
          <Reveal className="hidden lg:block">
            <div className="mx-auto w-[440px] -rotate-[4deg] overflow-hidden rounded-2xl border-4 border-cyan-brand bg-white shadow-plateLg shadow-cyan-brand/60">
              <div className="flex items-center justify-between bg-ink px-5 py-3">
                <span className="font-display text-sm font-bold text-cyan-brand">TR · RECF TÜRKİYE</span>
                <span className="font-display text-xs font-medium text-white/60">SEZON 26–27</span>
              </div>
              <p className="py-6 text-center font-display text-[88px] font-bold tracking-[6px] text-ink">905A</p>
              <p className="pb-5 text-center font-display text-[10.5px] font-medium tracking-[1px] text-ink/45">
                SENİN TAKIMIN — İLK MAÇTAN DÜNYA ŞAMPİYONASINA
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
