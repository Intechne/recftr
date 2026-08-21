import Link from "next/link";
import type { Metadata } from "next";
const registrationFaqs = [
  { q: "Kimler takım kurabilir?", a: "Programın yaş/kademe koşullarını sağlayan öğrenciler, 18 yaş üstü bir mentor eşliğinde takım oluşturabilir." },
  { q: "Takım numarası nasıl alınır?", a: "Bu sitedeki takım kayıt formunu gönderin. Başvuru CMS üzerinden onaylandıktan sonra takımınız oluşturulur ve mentor portal hesabı açılır." },
  { q: "Etkinlik kaydı nasıl yapılır?", a: "Onaylı takım mentorları Takım Portalı > Etkinlikler bölümünden programlarına uygun etkinliklere başvurabilir." },
  { q: "Belgeleri nereye yükleyeceğiz?", a: "Takım Portalı > Belgeler bölümünde programınıza tanımlanan zorunlu ve opsiyonel evrakları yükleyebilirsiniz." },
];
import { PageHead } from "@/components/Ui";
import { Reveal } from "@/components/Motion";

export const metadata: Metadata = { title: "Takım Kaydı Nasıl Yapılır?" };

const steps = [
  { title: "PROGRAMINI SEÇ", link: { t: "Program sayfaları", h: "/programlar" },
    desc: "Öğrencilerin yaşına göre program belirle: Engage (15 yaşa kadar, U12/U15) · Achieve (19 yaşa kadar, U15/U19) · Inspire (üniversite) · ADC (ortaokul/lise) · ADC Pro (13+ lise & üni). Kararsızsan Programlar sayfasındaki karşılaştırmayı kullan veya takim@recfturkiye.org'a yaz." },
  { title: "EKİBİNİ TOPLA", link: { t: "Mentor rehberi", h: "/rehber/mentor" },
    desc: "Engage için en az 2 öğrenci, Achieve için 1+ öğrenci yeterli; ideal ekip 4–6 kişidir. Her takımın 18 yaş üstü bir yetişkin mentoru (öğretmen, veli veya gönüllü) olmalı. Okul zorunlu değil — kulüp ve bağımsız topluluklar da kaydolabilir." },
  { title: "RECFEVENTS.ORG'DA TAKIMINI KAYDET", link: { t: "Ön kayıt formu", h: "/kayit" },
    desc: "Resmi kayıt platformu recfevents.org'da mentor hesabı aç, programını seç, takım bilgilerini gir ve sezon lisans ücretini öde. Sistem sana benzersiz takım numaranı (plakanı) verir — ör. 123A. Bu numara tüm sezonun kimliğidir." },
  { title: "DONANIMINI EDİN", link: { t: "Donanım rehberi", h: "/dokumanlar" },
    desc: "Engage: VEX IQ® veya LEGO® SPIKE/Mindstorms. Achieve: VEX V5® elektronik + Robits®/TETRIX® MAX yapı. ADC/ADC Pro: onaylı drone kitleri. Başlangıç kitleri ve yerel tedarik seçenekleri için Dokümanlar'daki donanım rehberine bak." },
  { title: "İLK ETKİNLİĞİNE BAŞVUR", link: { t: "Etkinlik takvimi", h: "/etkinlikler" },
    desc: "RECF Türkiye Etkinlikler sayfasından ilindeki veya bölgendeki etkinliği seç, takım numaranla başvur. Kontenjanlar sınırlı — erken kayıt hem yer garantiler hem indirim sağlar. Başvurun 24 saat içinde e-postayla onaylanır." },
  { title: "HAZIRLAN VE SAHAYA ÇIK", link: { t: "Sezon dokümanları", h: "/dokumanlar" },
    desc: "Oyun kılavuzunu indir, robotunu kur, mühendislik defterini tutmaya ilk günden başla. Etkinlik gününde robot denetiminden geç, açılış seremonisine katıl — plakan artık sahada!" },
];

export default function Rehber() {
  return (
    <div className="pb-20">
      <PageHead kicker="REHBER" title="TAKIM KAYDI NASIL YAPILIR?"
        sub="Sıfırdan sahaya: bir RECF takımı kurmanın ve ilk etkinliğe kaydolmanın eksiksiz yolu. Ortalama süre: 30 dakika başvuru + 24 saat onay." />
      <div className="safe-x mx-auto max-w-5xl space-y-4 lg:px-10">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 50}>
            <div className="flex gap-5 rounded-xl border-2 border-ink bg-white p-6 shadow-plateSm shadow-cyan-brand">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-2xl font-bold text-cyan-brand">{i + 1}</span>
              <div>
                <h2 className="font-display text-[18px] font-bold text-ink lg:text-[19px]">{s.title}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink/60">{s.desc}</p>
                <Link href={s.link.h} className="mt-2 inline-block font-display text-[13px] font-semibold text-cyan-deep hover:underline">{s.link.t} →</Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="safe-x mx-auto mt-12 max-w-5xl sm:mt-16 lg:px-10">
        <h2 className="font-display text-[26px] font-bold text-ink">SIK SORULAN SORULAR</h2>
        <div className="mt-5 space-y-3">
          {registrationFaqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group rounded-lg border-[1.5px] border-ink/20 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                {f.q}
                <span className="font-display text-xl font-bold text-cyan-deep group-open:hidden">+</span>
                <span className="hidden font-display text-xl font-bold text-cyan-deep group-open:inline">−</span>
              </summary>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/60">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-ink px-6 py-5">
          <p className="font-display text-[16px] font-bold text-white">HAZIRSAN BAŞLAYALIM — 2 dakikada ön kayıt.</p>
          <Link href="/kayit" className="rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink">TAKIM KAYDINA BAŞLA →</Link>
        </div>
      </div>
    </div>
  );
}
