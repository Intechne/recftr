"use client";
import { useState } from "react";
import type { EventItem } from "@/lib/data";
import { StatusPill } from "@/components/Ui";

export default function EventTabs({ event }: { event: EventItem }) {
  const hasTeams = !!event.registeredTeams?.length;
  const tabs = ["GENEL BAKIŞ", ...(hasTeams ? ["KAYITLI TAKIMLAR"] : []), "PROGRAM AKIŞI", "SAHA & ULAŞIM"];
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const teams = (event.registeredTeams ?? []).filter(
    (t) => t.num.toLowerCase().includes(q.toLowerCase()) || t.name.toLowerCase().includes(q.toLowerCase()) || t.school.toLowerCase().includes(q.toLowerCase())
  );
  const label = tabs[tab];

  return (
    <div>
      {/* Sekme çubuğu */}
      <div className="border-b-2 border-ink/15 bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 lg:px-10" role="tablist">
          {tabs.map((t, i) => (
            <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
              className={`whitespace-nowrap border-b-[3px] px-5 py-4 font-display text-[13px] tracking-wide transition-colors ${
                tab === i ? "border-cyan-brand font-bold text-ink" : "border-transparent font-medium text-ink/45 hover:text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        {/* GENEL BAKIŞ */}
        {label === "GENEL BAKIŞ" && (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border-2 border-ink bg-white p-7">
              <h2 className="font-display text-[20px] font-bold text-ink">ETKİNLİK HAKKINDA</h2>
              {event.about.map((p, i) => (
                <p key={i} className="mt-4 text-[15px] leading-relaxed text-ink/60">{p}</p>
              ))}
            </div>
            <div className="space-y-5">
              {event.missions && (
                <div>
                  <h3 className="font-display text-[17px] font-bold text-ink">GÜNÜN 4 GÖREVİ</h3>
                  <div className="mt-3.5 space-y-2.5">
                    {event.missions.map((m) => (
                      <div key={m.title} className="flex items-center gap-3.5 rounded-lg border-[1.5px] border-l-4 border-adc bg-white px-4 py-3">
                        <span aria-hidden>{m.icon}</span>
                        <span className="flex-1 font-display text-sm font-bold text-ink">{m.title}</span>
                        <span className="text-[12.5px] text-ink/50">{m.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {[["🧑‍🔧 TAKIMLAR İÇİN", event.forTeams], ["👨‍👩‍👧 SEYİRCİLER İÇİN", event.forVisitors], ["📷 BASIN İÇİN", event.forPress]]
                .filter(([, items]) => (items as string[]).length > 0)
                .map(([title, items]) => (
                  <div key={title as string} className="rounded-xl border-[1.5px] border-ink/20 bg-white p-5">
                    <h3 className="font-display text-[14px] font-bold text-ink">{title as string}</h3>
                    <ul className="mt-2.5 space-y-2">
                      {(items as string[]).map((it) => (
                        <li key={it} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/55">
                          <span className="mt-1 text-[8px] text-cyan-deep" aria-hidden>◆</span>{it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* KAYITLI TAKIMLAR */}
        {label === "KAYITLI TAKIMLAR" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-[22px] font-bold text-ink">KAYITLI TAKIMLAR — {event.registeredTeams!.length}<span className="text-ink/40"> (örnek liste)</span></h2>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Takım no veya okul ara…"
                className="w-64 rounded-md border-[1.5px] border-ink/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-cyan-deep" />
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border-2 border-ink bg-white">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="bg-ink font-display text-[11.5px] font-semibold tracking-[1.5px] text-white/50">
                    <th className="px-5 py-3">#</th><th className="px-3 py-3">TAKIM NO</th><th className="px-3 py-3">TAKIM ADI</th>
                    <th className="px-3 py-3">OKUL / KURUM</th><th className="px-3 py-3">İL</th><th className="px-3 py-3">DURUM</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <tr key={t.num} className={i % 2 ? "bg-paper/60" : "bg-white"}>
                      <td className="px-5 py-3.5 text-[13px] text-ink/40">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-3 py-3.5"><span className="rounded border-[1.5px] border-ink/30 bg-paper px-2.5 py-1 font-display text-[14px] font-bold text-ink">{t.num}</span></td>
                      <td className="px-3 py-3.5 font-semibold text-ink">{t.name}</td>
                      <td className="px-3 py-3.5 text-[14px] text-ink/55">{t.school}</td>
                      <td className="px-3 py-3.5 text-[14px] text-ink/55">{t.city}</td>
                      <td className="px-3 py-3.5"><StatusPill status={t.status} /></td>
                    </tr>
                  ))}
                  {teams.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-ink/45">Aramanla eşleşen takım yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROGRAM AKIŞI */}
        {label === "PROGRAM AKIŞI" && (
          <div className="overflow-hidden rounded-xl border-2 border-ink bg-white lg:max-w-3xl">
            <div className="bg-ink px-5 py-3.5 font-display text-[15px] font-bold text-cyan-brand">PROGRAM AKIŞI — {event.date.toUpperCase()}</div>
            {event.schedule.map((s, i) => (
              <div key={i} className={`flex items-center gap-5 px-5 py-3 ${i % 2 ? "bg-paper/60" : "bg-white"}`}>
                <span className="w-14 font-display text-[14px] font-bold text-cyan-deep">{s.time}</span>
                <span className={`text-[14.5px] ${s.strong ? "font-semibold text-ink" : "text-ink/75"}`}>{s.item}</span>
              </div>
            ))}
          </div>
        )}

        {/* SAHA & ULAŞIM */}
        {label === "SAHA & ULAŞIM" && (
          <div className="overflow-hidden rounded-xl border-2 border-ink bg-white lg:max-w-3xl">
            <div className="bg-ink px-5 py-3.5 font-display text-[15px] font-bold text-cyan-brand">SAHA & ULAŞIM</div>
            <div className="flex h-52 items-center justify-center bg-gradient-to-br from-[#ccd6e3] to-[#99aac2] text-[13px] text-ink/60">
              📍 [ Harita — {event.venue} ]
            </div>
            <ul className="space-y-3 p-5">
              {event.transit.map((t) => (
                <li key={t} className="text-[14px] text-ink/60">{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
