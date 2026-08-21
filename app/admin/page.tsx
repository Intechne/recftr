import Link from "next/link";

const stats = [
  { label: "BEKLEYEN TAKIM ONAYI", big: "12", sub: "3'ü ödeme doğrulaması", hex: "#E5303E" },
  { label: "YAYINDAKİ ETKİNLİK", big: "7", sub: "2 taslak", hex: "#29B9E5" },
  { label: "BU AY YAYINLANAN HABER", big: "9", sub: "1 zamanlanmış", hex: "#1E8CD9" },
  { label: "DOKÜMAN İNDİRME (30G)", big: "4.212", sub: "En çok: Pinnacle Kılavuzu", hex: "#8DC63F" },
];
const quick = [
  { t: "+ YENİ ETKİNLİK", href: "/admin/etkinlikler", primary: true },
  { t: "+ YENİ HABER", href: "/admin/haberler" },
  { t: "+ DOKÜMAN YÜKLE", href: "#" },
  { t: "+ DUYURU ŞERİDİ DÜZENLE", href: "#" },
];
const acts = [
  { who: "İpek", what: "905B takım başvurusunu onayladı", when: "5 dk önce" },
  { who: "Canan", what: "\"ADC Ankara\" etkinlik sayfasını güncelledi", when: "32 dk önce" },
  { who: "Ömer", what: "\"Sezon Açılışı\" haberini yayınladı", when: "2 sa önce" },
  { who: "Yusuf", what: "Pinnacle Kılavuzu v1.2'yi yükledi", when: "5 sa önce" },
];

export default function AdminHome() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border-[1.5px] border-ink bg-white p-5 shadow-plateSm" style={{ ["--tw-shadow-color" as string]: s.hex }}>
            <p className="font-display text-[10px] font-medium tracking-[1px] text-ink/50">{s.label}</p>
            <p className="mt-1 font-display text-[30px] font-bold text-ink">{s.big}</p>
            <p className="text-[12.5px] text-ink/55">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border-[1.5px] border-ink bg-white p-6">
          <h2 className="font-display text-[14px] font-bold text-ink">HIZLI İŞLEMLER</h2>
          <div className="mt-4 space-y-3">
            {quick.map((qq) => (
              <Link key={qq.t} href={qq.href}
                className={`block rounded-lg border-[1.5px] px-4.5 px-4 py-3.5 font-display text-[14px] font-bold transition-colors ${
                  qq.primary ? "border-ink bg-cyan-brand text-ink hover:bg-cyan-deep hover:text-white" : "border-ink/25 bg-paper text-ink hover:border-ink"}`}>
                {qq.t}
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-xl bg-ink p-6">
          <h2 className="font-display text-[14px] font-bold text-cyan-brand">SON AKTİVİTE</h2>
          <ul className="mt-4 space-y-4">
            {acts.map((a) => (
              <li key={a.what} className="flex gap-4">
                <span className="w-14 shrink-0 font-display text-[13px] font-bold text-cyan-brand">{a.who}</span>
                <span className="flex-1 text-[13.5px] leading-relaxed text-white/80">{a.what} <span className="text-white/40">· {a.when}</span></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
