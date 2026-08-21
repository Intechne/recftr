import Link from "next/link";

const cards = [
  { label: "SEZON DURUMU", big: "AKTİF · 2026–27", sub: "Lisans onaylı", hex: "#8DC63F" },
  { label: "SIRADAKİ ETKİNLİK", big: "14 EKİM", sub: "İstanbul Bölge Turnuvası", hex: "#29B9E5" },
  { label: "ÜYELER", big: "6 / 8", sub: "2 davet bekliyor", hex: "#1E8CD9" },
  { label: "ÖDEME", big: "₺6.400 ✓", sub: "Tümü tamamlandı", hex: "#8DC63F" },
];
const todos = [
  { done: true, t: "Takım kaydı ve plaka alımı" },
  { done: true, t: "Sezon lisans ödemesi" },
  { done: true, t: "İstanbul Bölge başvurusu" },
  { done: false, t: "Robot denetim ön formu (son: 7 Ekim)" },
  { done: false, t: "Mühendislik defteri ilk teslim" },
  { done: false, t: "Veli izin formları (2 eksik)" },
];
const anns = [
  { d: "07 AĞU", t: "Pinnacle kılavuzu v1.2 yayınlandı — değişiklik özeti ekte" },
  { d: "05 AĞU", t: "İstanbul Bölge pit yerleşim planı açıklandı (Pit B-12)" },
  { d: "28 TEM", t: "Denetim kriterleri güncellendi: genişleme ölçümü videosu" },
  { d: "22 TEM", t: "Mentor eğitimi Eylül dönemine kayıtlar açıldı" },
];

export default function PortalHome() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border-[1.5px] border-ink bg-white p-5 shadow-plateSm" style={{ ["--tw-shadow-color" as string]: c.hex }}>
            <p className="font-display text-[10.5px] font-medium tracking-[1.5px] text-ink/50">{c.label}</p>
            <p className="mt-1.5 font-display text-[24px] font-bold text-ink">{c.big}</p>
            <p className="mt-1 text-[13px] text-ink/55">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border-[1.5px] border-ink bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-ink">SEZONA HAZIRLIK KONTROL LİSTESİ</h2>
          <ul className="mt-4 space-y-2.5">
            {todos.map((t) => (
              <li key={t.t} className={`flex items-center gap-3.5 rounded-lg px-4 py-3 ${t.done ? "bg-green-50" : "bg-paper"}`}>
                <span className={`font-display text-[16px] font-bold ${t.done ? "text-green-700" : "text-ink/35"}`}>{t.done ? "✓" : "○"}</span>
                <span className={`text-[14px] ${t.done ? "text-ink/50" : "font-semibold text-ink"}`}>{t.t}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl bg-ink p-6">
          <h2 className="font-display text-[15px] font-bold text-cyan-brand">TAKIMINA ÖZEL DUYURULAR</h2>
          <ul className="mt-4 space-y-4.5 space-y-4">
            {anns.map((a) => (
              <li key={a.t} className="flex gap-4">
                <span className="w-16 shrink-0 font-display text-[12px] font-bold text-cyan-brand">{a.d}</span>
                <span className="text-[13.5px] leading-relaxed text-white/80">{a.t}</span>
              </li>
            ))}
          </ul>
          <Link href="/duyurular" className="mt-5 inline-block font-display text-[12px] font-semibold text-cyan-brand hover:underline">TÜM DUYURULAR →</Link>
        </section>
      </div>
    </div>
  );
}
