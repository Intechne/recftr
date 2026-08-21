import Link from "next/link";

const regs = [
  { name: "İSTANBUL BÖLGE TURNUVASI", meta: "14 Ekim 2026 · Teknopark İstanbul", status: "KAYITLI ✓ · PIT B-12", note: "Denetim formu bekleniyor", hex: "#8DC63F", active: true },
  { name: "ANTALYA İL ETKİNLİĞİ", meta: "28 Kasım 2026 · ANFAŞ", status: "BAŞVURU İNCELENİYOR", note: "Onay: ~24 saat", hex: "#1E8CD9", active: true },
  { name: "TÜRKİYE ŞAMPİYONASI", meta: "7 Şubat 2027 · İstanbul", status: "KAYIT AÇILMADI", note: "Bölge sonuçlarına göre davet", hex: "#9aa2b1", active: false },
];

export default function PortalEtkinlikler() {
  return (
    <div>
      <h1 className="font-display text-[20px] font-bold text-ink">ETKİNLİK KAYITLARIN</h1>
      <div className="mt-5 space-y-4">
        {regs.map((r) => (
          <div key={r.name} className={`rounded-xl border-[1.5px] bg-white p-5 ${r.active ? "border-ink shadow-plateSm" : "border-ink/30"}`}
            style={r.active ? { ["--tw-shadow-color" as string]: r.hex } : undefined}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-[18px] font-bold text-ink">{r.name}</h2>
                <p className="mt-1 text-[13.5px] text-ink/55">{r.meta}</p>
                <p className="mt-2.5 text-[13px] text-ink/60">→ {r.note}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="rounded-md border-[1.5px] px-3.5 py-2 font-display text-[12px] font-bold text-ink"
                  style={{ borderColor: r.hex, backgroundColor: `${r.hex}22` }}>{r.status}</span>
                <span className="font-display text-[12px] font-semibold text-cyan-deep">{r.active ? "DETAY & BELGELER →" : "TAKVİME EKLE"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/etkinlikler" className="mt-5 block rounded-xl bg-ink px-6 py-5 font-display text-[15px] font-bold text-cyan-brand transition-colors hover:bg-ink-soft">
        +&nbsp; YENİ ETKİNLİĞE BAŞVUR — takvimi görüntüle ve takımını kaydet
      </Link>
    </div>
  );
}
