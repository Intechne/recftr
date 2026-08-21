"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { events as staticEvents, programs } from "@/lib/data";
import { PageHead, CodeBadge, StatusPill } from "@/components/Ui";

const monthOf = (iso: string) => {
  const months = ["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];
  const [y, m] = iso.split("-");
  return `${months[parseInt(m) - 1]} ${y}`;
};

export default function EtkinliklerPage() {
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  useEffect(() => { fetch("/api/events").then(r => r.ok ? r.json() : []).then(setDbEvents).catch(() => {}); }, []);
  // DB otoritedir: mevcut slug'larda doluluk/durum güncellenir, yeni CMS etkinlikleri listeye eklenir.
  const stMap = (t: string) => t === "DOLU" ? "full" : (t === "YAKINDA" || t === "TAMAMLANDI") ? "soon" : "open";
  const isoOf = (label: string) => {
    const ay: Record<string, string> = { "ocak":"01","şubat":"02","mart":"03","nisan":"04","mayıs":"05","haziran":"06","temmuz":"07","ağustos":"08","eylül":"09","ekim":"10","kasım":"11","aralık":"12" };
    const m = label.toLowerCase().match(/(\d{1,2})?\s*(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\s*(\d{4})/);
    return m ? `${m[3]}-${ay[m[2]]}-${(m[1] ?? "1").padStart(2, "0")}` : "2027-06-01";
  };
  const events = (() => {
    const merged = staticEvents.map(se => {
      const d = dbEvents.find(x => x.slug === se.slug);
      return d ? { ...se, registered: d.registered, capacity: d.capacity, status: stMap(d.status), date: d.date_label, city: d.city, venue: d.venue || se.venue } : se;
    }).filter(se => !dbEvents.length || dbEvents.some(x => x.slug === se.slug));
    const extras = dbEvents.filter(x => !staticEvents.some(se => se.slug === x.slug)).map(x => ({
      slug: x.slug, title: x.title, city: x.city, venue: x.venue || "Açıklanacak",
      date: x.date_label, dateISO: isoOf(x.date_label),
      program: (programs.find(pp => pp.code === x.code)?.slug ?? "achieve"),
      status: stMap(x.status), capacity: x.capacity, registered: x.registered, desc: x.excerpt || "",
    })) as any[];
    return [...merged, ...extras];
  })();

  const [prog, setProg] = useState<string>("TÜMÜ");
  const [status, setStatus] = useState<string>("TÜMÜ");
  const filtered = events.filter((e) => {
    const p = programs.find((x) => x.slug === e.program)!;
    return (prog === "TÜMÜ" || p.code === prog) &&
      (status === "TÜMÜ" || (status === "KAYIT AÇIK" && e.status === "open") || (status === "DOLU" && e.status === "full") || (status === "YAKINDA" && e.status === "soon"));
  });
  const byMonth = filtered.reduce<Record<string, typeof events>>((acc, e) => {
    const m = monthOf(e.dateISO);
    (acc[m] ||= [] as any).push(e);
    return acc;
  }, {});

  return (
    <div className="pb-20">
      <PageHead kicker="SEZON 2026–27" title="ETKİNLİK TAKVİMİ" />
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {/* Filtreler */}
        <div className="flex flex-wrap items-center gap-2.5">
          {["TÜMÜ", "ENG", "ACH", "INS", "ADC", "PRO"].map((f) => (
            <button key={f} onClick={() => setProg(f)}
              className={`rounded-md border-[1.5px] px-4 py-2 font-display text-[13px] font-semibold transition-colors ${
                prog === f ? "border-ink bg-ink text-white" : "border-ink/25 bg-white text-ink hover:border-ink"}`}>
              {f}
            </button>
          ))}
          <span className="mx-1 text-ink/25">|</span>
          {["TÜMÜ", "KAYIT AÇIK", "DOLU", "YAKINDA"].map((f) => (
            <button key={f} onClick={() => setStatus(f)}
              className={`rounded-md border-[1.5px] px-4 py-2 font-display text-[13px] font-semibold transition-colors ${
                status === f ? "border-ink bg-ink text-white" : "border-ink/25 bg-white text-ink hover:border-ink"}`}>
              {f === "TÜMÜ" ? "DURUM: TÜMÜ" : f}
            </button>
          ))}
        </div>

        {/* Ay grupları */}
        {Object.entries(byMonth).map(([month, list]) => (
          <div key={month} className="mt-10">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-[20px] font-bold text-ink">{month}</h2>
              <span className="h-0.5 flex-1 bg-ink/10" />
            </div>
            <div className="mt-4 space-y-3.5">
              {list.map((e) => {
                const p = programs.find((x) => x.slug === e.program)!;
                return (
                  <Link key={e.slug} href={`/etkinlikler/${e.slug}`}
                    className="flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] bg-white px-5 py-4 transition-shadow hover:shadow-md lg:gap-5"
                    style={{ borderColor: p.hex, borderLeftWidth: 5 }}>
                    <span className="w-12 font-display text-[30px] font-bold leading-none text-ink">{e.date.split(" ")[0].padStart(2, "0")}</span>
                    <CodeBadge code={p.code} hex={p.hex} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{e.name}</span>
                      <span className="block text-[13.5px] text-ink/50">{e.venue} · {e.city}</span>
                    </span>
                    <span className="hidden font-display text-[13px] font-semibold text-ink/50 sm:block">
                      {e.status === "soon" ? "—" : `${e.capacity} TAKIM`}
                    </span>
                    <StatusPill status={e.status} />
                    <span className="font-display text-lg font-bold text-ink" aria-hidden>→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="mt-14 rounded-xl border-2 border-dashed border-ink/20 bg-white p-10 text-center text-ink/50">
            Bu filtrelerle eşleşen etkinlik yok. Filtreleri genişletmeyi dene.
          </p>
        )}
      </div>
    </div>
  );
}
