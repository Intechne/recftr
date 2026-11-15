import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/Ui";
import { Reveal } from "@/components/Motion";
import { pageMeta } from "@/lib/seo";
import { RECF_TEAM_FEE, WORLD_CHAMPIONSHIP } from "@/lib/site-config";
import TrackView from "@/components/analytics/TrackView";
import RecfEventsLink from "@/components/analytics/RecfEventsLink";
import LeadForm from "@/components/public/LeadForm";

export const metadata: Metadata = pageMeta({
  title: "Takım Kaydı Rehberi — RECFEvents.org'da Resmî Kayıt",
  description: `RECF takım kaydı adım adım: RECFEvents.org'da yetişkin hesabı, takım kaydı, ${RECF_TEAM_FEE.label} sezon kayıt ücreti ve etkinlik seçimi.`,
  path: "/rehber/takim-kaydi",
});

type Step = { title: string; desc: React.ReactNode; link?: { t: string; h: string } | "recfevents" };

const steps: Step[] = [
  { title: "PROGRAMINI SEÇ", link: { t: "Program sayfaları", h: "/programlar" },
    desc: "Öğrencilerinin yaşına ve kademesine uygun programı belirle: RECF Engage, RECF Achieve, RECF Inspire, Aerial Drone Competition (ADC) veya ADC Pro. Kesin uygunluk koşulları programın resmî kılavuzunda yer alır." },
  { title: "EKİBİNİ TOPLA", link: { t: "Mentor rehberi", h: "/rehber/mentor" },
    desc: "Her takımın 18 yaş üstü bir yetişkin mentoru (öğretmen, veli veya gönüllü) olmalı. Okul zorunlu değil; kulüp ve bağımsız topluluklar da takım kurabilir." },
  { title: "RECF TÜRKİYE ÖN BAŞVURUNU YAP", link: { t: "Takımını başvur", h: "/kayit" },
    desc: "Takım ve mentor bilgilerinle ön başvuru formunu doldur. Böylece RECF Türkiye ekibi takımını tanır ve kayıt sürecinde sana destek olur. Ön başvuru ücretsizdir; resmî kayıt yerine geçmez." },
  { title: "RECFEVENTS.ORG'DA YETİŞKİN HESABI AÇ", link: "recfevents",
    desc: "RECFEvents.org hesapları 18 yaş ve üzeri yetişkinler (antrenör, mentor, veli ve etkinlik partnerleri) içindir. Öğrencilerin hesap açması gerekmez; takımı antrenörü kaydeder." },
  { title: "TAKIMINI KAYDET VE ÜCRETİ ÖDE", link: "recfevents",
    desc: <>Hesabınla giriş yap, takımını oluştur ve programını seç. {RECF_TEAM_FEE.season} sezonu RECF takım kayıt ücreti <strong className="text-ink">takım başına {RECF_TEAM_FEE.label}</strong> ve ödeme RECFEvents.org üzerinden yapılır. Takım Bursu ve kurumsal paket seçenekleri için <Link href="/okullar#randevu" className="font-semibold text-cyan-deep underline">bize ulaş</Link>.</> },
  { title: "ETKİNLİĞİNİ SEÇ VE SAHAYA HAZIRLAN", link: { t: "Etkinlik takvimi", h: "/etkinlikler" },
    desc: `RECFEvents.org'da etkinlikleri programına göre listeleyebilir, takımını etkinliğe kaydedebilirsin. RECF Türkiye etkinlikleri Etkinlik Takvimi'nde duyurulur. RECF etkinliklerine katılım, ${WORLD_CHAMPIONSHIP.name}'e (${WORLD_CHAMPIONSHIP.label}, ${WORLD_CHAMPIONSHIP.city}) giden yoldur.` },
];

const registrationFaqs = [
  { q: "Ön başvuru ile resmî kayıt arasındaki fark ne?", a: "Ön başvuru RECF Türkiye ekibinin takımını tanıması ve sana destek olması içindir. Resmî sezon kaydı, takım numarası ve kayıt ücreti ödemesi RECFEvents.org üzerinden tamamlanır." },
  { q: "Kayıt ücreti ne kadar?", a: `${RECF_TEAM_FEE.season} sezonu için RECF resmî takım kayıt ücreti takım başına ${RECF_TEAM_FEE.label}. Etkinliklerin varsa ayrıca katılım koşulları etkinlik sayfasında duyurulur.` },
  { q: "Öğrencilerin hesap açması gerekiyor mu?", a: "Hayır. RECFEvents.org hesapları 18 yaş ve üzeri yetişkinler içindir; takımı antrenörü veya mentoru kaydeder." },
  { q: "Takıldığım bir adım olursa?", a: "Bu sayfanın altındaki formdan destek randevusu alabilirsin; ekibimiz seninle iletişime geçer." },
];

export default function Rehber() {
  return (
    <div className="pb-20">
      <TrackView event="guide_view" props={{ guide: "takim-kaydi" }} />
      <PageHead kicker="REHBER" title="TAKIM KAYDI NASIL YAPILIR?"
        sub="Sıfırdan sahaya: RECF takımı kurmanın ve resmî kaydı RECFEvents.org'da tamamlamanın adım adım yolu." />
      <div className="safe-x mx-auto max-w-5xl lg:px-10">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border-2 border-ink bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-brand">RESMÎ KAYIT ÜCRETİ · {RECF_TEAM_FEE.season}</p><p className="mt-1 font-display text-[30px] font-bold leading-none">{RECF_TEAM_FEE.label} <span className="text-[15px] font-semibold text-white/65">/ takım</span></p><p className="mt-2 text-sm text-white/70">Ödeme RECFEvents.org üzerinden. Takım Bursu ve kurumsal paket seçenekleri için bize ulaşın.</p></div>
          <a href={RECF_TEAM_FEE.source} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-cyan-brand underline">Kaynak: RECF SSS<span className="sr-only"> (yeni sekmede açılır)</span></a>
        </div>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 50}>
                <div className="flex gap-4 rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand sm:gap-5 sm:p-6">
                  <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-xl font-bold text-cyan-brand sm:h-14 sm:w-14 sm:text-2xl">{i + 1}</span>
                  <div className="min-w-0">
                    <h2 className="font-display text-[17px] font-bold text-ink lg:text-[19px]"><span className="sr-only">Adım {i + 1}: </span>{s.title}</h2>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink/65">{s.desc}</p>
                    {s.link === "recfevents" ? <RecfEventsLink placement={`rehber-adim-${i + 1}`} className="mt-2 inline-block font-display text-[13px] font-semibold text-cyan-deep hover:underline">RECFEvents.org ↗</RecfEventsLink>
                      : s.link && <Link href={s.link.h} className="mt-2 inline-block font-display text-[13px] font-semibold text-cyan-deep hover:underline">{s.link.t} →</Link>}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      <div className="safe-x mx-auto mt-12 max-w-5xl sm:mt-16 lg:px-10">
        <h2 className="font-display text-[26px] font-bold text-ink">SIK SORULAN SORULAR</h2>
        <div className="mt-5 space-y-3">
          {registrationFaqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group rounded-lg border-[1.5px] border-ink/20 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                {f.q}
                <span aria-hidden className="font-display text-xl font-bold text-cyan-deep group-open:hidden">+</span>
                <span aria-hidden className="hidden font-display text-xl font-bold text-cyan-deep group-open:inline">−</span>
              </summary>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/65">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink/65">Daha fazlası için <Link href="/sss" className="font-semibold text-cyan-deep underline">Sık Sorulan Sorular</Link>.</p>
        <div className="mt-10 flex flex-col gap-4 rounded-xl bg-ink px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-[16px] font-bold text-white">HAZIRSAN BAŞLAYALIM.</p>
          <div className="flex flex-col gap-3 min-[460px]:flex-row">
            <Link href="/kayit" className="inline-flex min-h-11 items-center justify-center rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink">TAKIMINI BAŞVUR →</Link>
            <a href="#destek" className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-white/40 px-5 py-3 font-display text-[13px] font-bold text-white">DESTEK RANDEVUSU AL ↓</a>
          </div>
        </div>
        <section id="destek" className="mt-12 scroll-mt-28">
          <LeadForm kind="destek_randevu" title="DESTEK RANDEVUSU" intro="Resmî kayıt, hesap veya ödeme adımında nerede takıldığını yaz; uygun zamanda seni arayalım ya da e-postayla dönelim." submitLabel="RANDEVU TALEP ET" />
        </section>
      </div>
    </div>
  );
}
