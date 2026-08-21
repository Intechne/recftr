import type { Metadata } from "next";
import { teamMembers } from "@/lib/data";
import { PageHead, Photo } from "@/components/Ui";
import { Reveal } from "@/components/Motion";

export const metadata: Metadata = { title: "Hakkımızda & Ekibimiz" };

const roles = [
  { icon: "🏟", title: "ETKİNLİK OPERASYONU", desc: "Saha kurulumu, hakemlik, skor yönetimi" },
  { icon: "🎓", title: "EĞİTİM & KOÇLUK", desc: "Müfredat, mentor eğitimleri, atölyeler" },
  { icon: "🤝", title: "OKUL ORTAKLIKLARI", desc: "Kurumsal programlar, il koordinasyonu" },
  { icon: "📡", title: "MEDYA & YAYIN", desc: "Canlı yayın, sezon içerikleri, basın" },
];
const channels = [
  { label: "GENEL", val: "info@recfturkiye.org", note: "24 saat içinde yanıt" },
  { label: "TAKIM DESTEĞİ", val: "takim@recfturkiye.org", note: "Kayıt ve plaka işlemleri" },
  { label: "OKULLAR & KURUMSAL", val: "kurumsal@recfturkiye.org", note: "Ortaklık ve etkinlik talepleri" },
  { label: "BASIN", val: "medya@recfturkiye.org", note: "Akreditasyon ve görsel talepleri" },
  { label: "TELEFON", val: "+90 (212) 909 23 10", note: "Hafta içi 09:00–18:00" },
  { label: "ADRES", val: "Teknopark İstanbul, Pendik", note: "Ziyaret randevuyla" },
];

export default function HakkimizdaPage() {
  return (
    <div className="pb-20">
      <PageHead kicker="KURUMSAL" title="SAHANIN ARKASINDAKİ EKİP" />
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        {/* Biz kimiz + rol kartları */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border-2 border-ink bg-white p-7">
            <h2 className="font-display text-[19px] font-bold text-ink">RECF TÜRKİYE KİMDİR?</h2>
            <p className="mt-3.5 text-[15px] leading-[1.7] text-ink/65">
              RECF Türkiye, RECF&apos;in (Robotics Education &amp; Competition Foundation) resmi Türkiye partneri
              olarak Intechne Teknoloji A.Ş. tarafından yürütülmektedir. Misyonumuz: her öğrencinin yaşına
              uygun bir arenada gerçek yarışma deneyimi yaşamasını sağlamak; il etkinliklerinden dünya
              şampiyonasına uzanan şeffaf, ölçülebilir ve erişilebilir bir yol kurmak.
            </p>
            <p className="mt-3.5 text-[15px] leading-[1.7] text-ink/65">
              Etkinliklerimiz kendi geliştirdiğimiz saha ve kayıt altyapısıyla yönetilir; program kuralları
              RECF resmi kılavuzlarını birebir takip eder. RECF ve VEX Robotics ayrı kuruluşlardır.
            </p>
          </div>
          <div className="space-y-3.5">
            {roles.map((r) => (
              <div key={r.title} className="flex items-center gap-4 rounded-lg border-[1.5px] border-ink/20 bg-white px-5 py-3.5">
                <span className="text-[22px]" aria-hidden>{r.icon}</span>
                <span>
                  <span className="block font-display text-[14px] font-bold text-ink">{r.title}</span>
                  <span className="block text-[13px] text-ink/55">{r.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EKİBİMİZ */}
        <div id="ekibimiz" className="scroll-mt-24 pt-16">
          <p className="font-display text-[12px] font-semibold tracking-[2px] text-cyan-deep">⬡ EKİBİMİZ</p>
          <h2 className="mt-2 font-display text-[30px] font-bold text-ink lg:text-[34px]">SAHAYI KURAN KADRO</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((m, i) => (
              <Reveal key={m.name + m.role} delay={(i % 4) * 60}>
                <div className="h-full overflow-hidden rounded-xl border-[1.5px] border-ink/20 bg-white">
                  <Photo label={m.name === "Açık Pozisyon" ? "Bu koltuk boş — belki sensin?" : `Portre — ${m.name}`} tone={`bg-gradient-to-br ${m.tone}`} className="h-44 rounded-none" />
                  <div className="p-4">
                    <h3 className="font-display text-[16px] font-bold text-ink">{m.name}</h3>
                    <p className="mt-0.5 font-display text-[11px] font-semibold tracking-[1px] text-cyan-deep">{m.role.toUpperCase()}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/55">{m.focus}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-ink px-6 py-4.5 px-6 py-4">
            <p className="font-display text-[15px] font-bold text-white">
              EKİBE KATILMAK İSTER MİSİN? Hakemlik, saha gönüllülüğü ve staj başvuruları açık.
            </p>
            <a href="mailto:info@recfturkiye.org?subject=Gönüllü Başvurusu" className="rounded-md bg-cyan-brand px-4.5 px-4 py-2.5 font-display text-[13px] font-bold text-ink">GÖNÜLLÜ OL →</a>
          </div>
        </div>

        {/* İLETİŞİM */}
        <div id="iletisim" className="scroll-mt-24 pt-16">
          <h2 className="font-display text-[26px] font-bold text-ink">İLETİŞİM KANALLARI</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              {channels.map((c) => (
                <div key={c.label} className="flex flex-wrap items-center gap-4 rounded-lg border-[1.5px] border-ink/20 bg-white px-4.5 px-4 py-3.5">
                  <span className="rounded bg-ink px-2.5 py-1.5 font-display text-[10px] font-bold tracking-[1px] text-cyan-brand">{c.label}</span>
                  <span className="min-w-0 flex-1 font-semibold text-ink">{c.val}</span>
                  <span className="text-[12.5px] text-ink/50">{c.note}</span>
                </div>
              ))}
            </div>
            <form className="rounded-xl bg-ink p-6">
              <h3 className="font-display text-[17px] font-bold text-cyan-brand">HIZLI MESAJ</h3>
              {["Adınız Soyadınız", "E-posta"].map((f) => (
                <input key={f} placeholder={f} className="mt-3 w-full rounded-md border border-white/25 bg-white/[.08] px-3.5 py-3 text-[14px] text-white placeholder:text-white/50 outline-none focus:border-cyan-brand" />
              ))}
              <select className="mt-3 w-full rounded-md border border-white/25 bg-white/[.08] px-3.5 py-3 text-[14px] text-white/80 outline-none focus:border-cyan-brand">
                {["Konu: Genel", "Konu: Takım Desteği", "Konu: Kurumsal", "Konu: Basın"].map((o) => <option key={o} className="text-ink">{o}</option>)}
              </select>
              <textarea placeholder="Mesajınız…" rows={4} className="mt-3 w-full rounded-md border border-white/25 bg-white/[.08] px-3.5 py-3 text-[14px] text-white placeholder:text-white/50 outline-none focus:border-cyan-brand" />
              <button type="button" className="mt-4 w-full rounded-md bg-cyan-brand py-3.5 font-display text-[14px] font-bold text-ink transition-colors hover:bg-white">GÖNDER</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
