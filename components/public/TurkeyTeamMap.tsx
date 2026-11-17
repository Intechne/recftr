import { PROVINCE_GEO, canonicalProvince } from "@/lib/tr-provinces-geo";

const W = 1000, H = 440, LON: [number, number] = [25.6, 45.0], LAT: [number, number] = [35.7, 42.3];
const project = ([lat, lon]: [number, number]) => [((lon - LON[0]) / (LON[1] - LON[0])) * W, ((LAT[1] - lat) / (LAT[1] - LAT[0])) * H] as const;

/** İllere göre takım dağılımı. Yalnız il bazında toplam sayı gösterir; takım/kişi verisi içermez. */
export default function TurkeyTeamMap({ counts }: { counts: { city: string; count: number }[] }) {
  const totals = new Map<string, number>();
  for (const row of counts) { const name = canonicalProvince(String(row.city || "")); if (name) totals.set(name, (totals.get(name) || 0) + (Number(row.count) || 0)); }
  const ranked = [...totals.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"));
  const max = ranked[0]?.[1] || 1, total = ranked.reduce((sum, [, n]) => sum + n, 0);
  const summary = `${ranked.length} ilden ${total} takım. ${ranked.slice(0, 5).map(([city, n]) => `${city}: ${n}`).join(", ")}.`;
  return <div className="grid gap-6 lg:grid-cols-[1.7fr_.8fr] lg:items-center">
    <figure className="field-grid-dark relative overflow-hidden rounded-xl border-2 border-ink bg-ink p-3 sm:p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Türkiye takım dağılımı haritası. ${summary}`}>
        {Object.entries(PROVINCE_GEO).map(([name, geo]) => { const [x, y] = project(geo); return <rect key={name} x={x - 3} y={y - 3} width={6} height={6} rx={1} transform={`rotate(45 ${x} ${y})`} fill="rgba(255,255,255,.18)" />; })}
        {ranked.map(([name, n]) => { const [x, y] = project(PROVINCE_GEO[name]); const r = 8 + Math.sqrt(n / max) * 22; return <g key={name}>
          <circle cx={x} cy={y} r={r} fill="rgba(41,185,229,.28)" stroke="#29B9E5" strokeWidth={2} />
          <circle cx={x} cy={y} r={4} fill="#29B9E5" />
          {r > 14 && <text x={x} y={y - r - 6} textAnchor="middle" fontFamily="Chakra Petch, sans-serif" fontWeight={700} fontSize={18} fill="#fff">{n}</text>}
        </g>; })}
      </svg>
      <figcaption className="mt-2 font-display text-xs tracking-[1px] text-white/60">İL MERKEZLERİNE GÖRE YAKLAŞIK YERLEŞİM · AKTİF TAKIMLAR</figcaption>
    </figure>
    <div>
      <p className="font-display text-[44px] font-bold leading-none text-ink">{ranked.length}<span className="text-cyan-deep"> İL</span></p>
      <p className="mt-2 text-[15px] text-ink/65">{total} aktif takım sahada.</p>
      <ol className="mt-5 divide-y divide-ink/10 rounded-xl border-2 border-ink bg-white">{ranked.slice(0, 8).map(([city, n], i) => <li key={city} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]"><span className="flex items-center gap-3"><span className="w-5 font-display text-xs font-bold text-ink/65">{i + 1}</span><span className="font-semibold text-ink">{city}</span></span><span className="font-display font-bold text-cyan-deep">{n}</span></li>)}</ol>
    </div>
  </div>;
}
