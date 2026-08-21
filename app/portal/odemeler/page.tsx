const payments = [
  { id: "FT-2026-0912", item: "ACH Sezon Lisansı (905A)", date: "28 Tem 2026", amount: "₺4.500", status: "ÖDENDİ" },
  { id: "FT-2026-0913", item: "Pinnacle Saha Kiti", date: "28 Tem 2026", amount: "₺2.800", status: "ÖDENDİ" },
  { id: "İND-ERKEN26", item: "Erken Kayıt İndirimi", date: "28 Tem 2026", amount: "−₺900", status: "UYGULANDI" },
  { id: "FT-2026-1044", item: "İstanbul Bölge Turnuvası katılımı", date: "16 Ağu 2026", amount: "₺750", status: "ÖDENDİ" },
  { id: "FT-2026-1102", item: "Kış Kupası ön kaydı", date: "—", amount: "₺750", status: "BEKLİYOR" },
];

export default function OdemelerPage() {
  const paid = payments.filter(p => p.status !== "BEKLİYOR");
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[26px] font-bold text-ink">ÖDEMELER</h1>
      <p className="mt-1 text-[14.5px] text-ink/60">Sezon ödemeleri, faturalar ve bekleyen tahsilatlar.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["SEZON TOPLAMI", "₺7.900", "lisans + kit + etkinlik"], ["İNDİRİM", "₺900", "erken kayıt"], ["BEKLEYEN", "₺750", "Kış Kupası"]].map(([t, v, d]) => (
          <div key={t} className="rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand">
            <p className="font-display text-[11px] font-semibold tracking-[1.5px] text-ink/50">{t}</p>
            <p className="mt-1 font-display text-[30px] font-bold text-ink">{v}</p>
            <p className="text-[12px] text-ink/45">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border-2 border-ink bg-white">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead className="bg-ink font-display text-[11.5px] tracking-[1px] text-white">
            <tr>{["FATURA NO", "KALEM", "TARİH", "TUTAR", "DURUM", ""].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {payments.map(p => (
              <tr key={p.id + p.item} className="hover:bg-paper">
                <td className="px-4 py-3.5 font-display text-[12.5px] font-bold text-ink/70">{p.id}</td>
                <td className="px-4 py-3.5 font-semibold text-ink">{p.item}</td>
                <td className="px-4 py-3.5 text-ink/60">{p.date}</td>
                <td className={`px-4 py-3.5 font-display font-bold ${p.amount.startsWith("−") ? "text-emerald-700" : "text-ink"}`}>{p.amount}</td>
                <td className="px-4 py-3.5">
                  <span className={`rounded-md border px-2 py-0.5 font-display text-[10.5px] font-bold ${
                    p.status === "BEKLİYOR" ? "border-amber-600 bg-amber-100 text-amber-800" : "border-emerald-600 bg-emerald-100 text-emerald-800"}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  {p.status === "ÖDENDİ" && <button className="font-display text-[12px] font-bold text-cyan-deep hover:underline">FATURA ↓</button>}
                  {p.status === "BEKLİYOR" && <button className="rounded-md bg-cyan-brand px-3 py-1.5 font-display text-[11.5px] font-bold text-ink">ÖDE →</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[12.5px] text-ink/50">Kurumsal fatura ve sponsor ödemeleri için: <span className="font-semibold text-ink/70">finans@recfturkiye.org</span> · Havale/EFT dekontlarını Belgeler sayfasından yükleyebilirsiniz.</p>
    </div>
  );
}
