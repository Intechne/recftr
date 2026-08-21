"use client";
import { useEffect, useState } from "react";
import { programs, teams } from "@/lib/data";
import { PageHead, CodeBadge } from "@/components/Ui";

export default function TakimlarPage() {
  const [code, setCode] = useState("TÜM PROGRAMLAR");
  const [q, setQ] = useState("");
  const [dbTeams, setDbTeams] = useState<{ num: string; name: string; school: string; city: string; program: string }[]>([]);
  useEffect(() => { fetch("/api/teams").then(r => r.ok ? r.json() : []).then(setDbTeams).catch(() => {}); }, []);
  const codeOf = (slug: string) => programs.find(p => p.slug === slug)?.code ?? "ACH";
  const allTeams = [
    ...dbTeams.filter(t => !teams.some(s => s.num === t.num)).map(t => ({ num: t.num, name: t.name, school: t.school + " · " + t.city, code: codeOf(t.program), hex: "#8DC63F", rookie: true, fresh: true })),
    ...teams.map(t => ({ ...t, fresh: false })),
  ];
  const filtered = allTeams.filter((t) =>
    (code === "TÜM PROGRAMLAR" || t.code === code) &&
    (t.num + t.name + t.school).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="pb-20">
      <PageHead kicker="TAKIM DİZİNİ" title="TÜRKİYE'NİN TAKIMLARI — 512"
        sub="2026–27 sezonuna kayıtlı takımlar. Kendi plakanı almak için Takım Kaydı sayfasına git." />
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex flex-wrap items-center gap-2.5">
          {["TÜM PROGRAMLAR", "ENG", "ACH", "INS", "ADC", "PRO"].map((f) => (
            <button key={f} onClick={() => setCode(f)}
              className={`rounded-md border-[1.5px] px-4 py-2 font-display text-[13px] font-semibold transition-colors ${
                code === f ? "border-ink bg-ink text-white" : "border-ink/25 bg-white text-ink hover:border-ink"}`}>
              {f}
            </button>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Takım ara…"
            className="rounded-md border-[1.5px] border-ink/25 bg-white px-3.5 py-2 text-sm outline-none focus:border-cyan-deep" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((t) => (
            <div key={t.num} className="plate-hover overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plateSm" style={{ ["--tw-shadow-color" as string]: t.hex }}>
              <div className="flex items-center justify-between bg-ink px-4 py-3">
                <span className="font-display text-[20px] font-bold text-white">{t.num}</span>
                <CodeBadge code={t.code} hex={t.hex} />
              </div>
              <div className="p-4">
                <h2 className="font-display text-[16px] font-bold text-ink">{t.name}
                  {"rookie" in t && <span className="ml-2 rounded bg-emerald-600 px-1.5 py-0.5 align-middle font-display text-[9px] font-bold text-white">● YENİ KAYIT</span>}
                </h2>
                <p className="mt-1 text-[12.5px] text-ink/55">{t.school}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full rounded-xl border-2 border-dashed border-ink/20 bg-white p-10 text-center text-ink/50">Aramanla eşleşen takım yok.</p>}
        </div>
        <p className="mt-6 text-[13px] text-ink/45">Dizin örnek verilerle gösterilmektedir; canlı sistemde recfevents.org kayıtlarından beslenir.</p>
      </div>
    </div>
  );
}
