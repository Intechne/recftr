import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { FigmaIcon } from "@/components/FigmaIcon";
import LeadForm from "@/components/public/LeadForm";
import RecfEventsLink from "@/components/analytics/RecfEventsLink";
import { RECF_TEAM_FEE } from "@/lib/site-config";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

export const metadata: Metadata = pageMeta({ title: "Başvurun Alındı", description: "RECF Türkiye ön başvurun alındı. Resmî takım kaydını RECFEvents.org'da tamamlamak için sonraki adımlar.", path: "/kayit/tesekkurler", noIndex: true });
export const dynamic = "force-dynamic";

export default async function Tesekkurler({ searchParams }: { searchParams: Promise<{ ref?: string | string[]; mail?: string | string[] }> }) {
  const query = await searchParams;
  const ref = typeof query.ref === "string" && /^\d{1,9}$/.test(query.ref) ? `#${query.ref.padStart(4, "0")}` : "";
  const mailAccepted = query.mail === "1";
  const steps = [
    { title: "RESMÎ KAYDINI TAMAMLA", text: `Takımını RECFEvents.org’da kaydet ve ${RECF_TEAM_FEE.season} sezon kayıt ücretini (${RECF_TEAM_FEE.label}) öde. Hesaplar 18 yaş üstü antrenör ve mentorlar içindir.`, action: <RecfEventsLink placement="tesekkurler" className="mt-3 inline-flex min-h-11 items-center rounded-md bg-ink px-4 py-2.5 font-display text-[12px] font-bold text-white">RECFEVENTS.ORG’A GİT ↗</RecfEventsLink> },
    { title: "REHBERİ ADIM ADIM İZLE", text: "Hesap açmaktan etkinlik seçmeye kadar resmî kayıt sürecini rehberimizde anlattık.", action: <Link href="/rehber/takim-kaydi" className="mt-3 inline-flex min-h-11 items-center rounded-md border-2 border-ink px-4 py-2.5 font-display text-[12px] font-bold">TAKIM KAYDI REHBERİ →</Link> },
    { title: "TAKILIRSAN DESTEK AL", text: "Kayıt veya ödeme adımında yardıma ihtiyacın olursa destek randevusu al; ekibimiz seninle görüşsün.", action: <a href="#destek" className="mt-3 inline-flex min-h-11 items-center rounded-md border-2 border-ink px-4 py-2.5 font-display text-[12px] font-bold">DESTEK RANDEVUSU AL ↓</a> },
  ];
  return <div className="pb-20">
    <section className="field-grid border-b-2 border-ink">
      <div className="safe-x mx-auto max-w-7xl py-12 lg:px-10 lg:py-16">
        <p className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 font-display text-xs font-bold tracking-[1.5px] text-cyan-brand"><FigmaIcon name="rozet" className="h-4 w-4" /> ÖN BAŞVURU ALINDI{ref ? ` · ${ref}` : ""}</p>
        <h1 className="mt-5 font-display text-[clamp(2.3rem,8vw,4.25rem)] font-bold leading-[.98]">BAŞVURUN ALINDI.<br /><span className="text-cyan-deep">ŞİMDİ RESMÎ KAYIT.</span></h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink/65">RECF Türkiye ekibi ön başvurunu inceleyecek. Takımının sezona katılması için resmî kaydı <strong>RECFEvents.org</strong> üzerinde tamamlaman gerekiyor.</p>
        <p role="status" className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/65">{mailAccepted ? "Başvuru alındı e-postasını gelen kutunda kontrol edebilirsin; görünmüyorsa spam klasörüne de bak." : `Başvurun kaydedildi. Otomatik e-posta iletilemediyse başvuru numaranı saklayabilir, ${PUBLIC_CONTACT.support} adresine yazabilirsin.`}</p>
      </div>
    </section>
    <div className="safe-x mx-auto max-w-7xl lg:px-10">
      <ol className="grid gap-4 py-12 md:grid-cols-3">{steps.map((step, i) => <li key={step.title} className="flex flex-col rounded-xl border-2 border-ink bg-white p-6 shadow-plateSm shadow-cyan-brand"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink font-display text-xl font-bold text-cyan-brand">{i + 1}</span><h2 className="mt-4 font-display text-[18px] font-bold">{step.title}</h2><p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink/65">{step.text}</p><div>{step.action}</div></li>)}</ol>
      <section id="destek" className="scroll-mt-28 grid gap-7 border-t-2 border-ink pt-12 lg:grid-cols-[1.6fr_.8fr]">
        <LeadForm kind="destek_randevu" title="DESTEK RANDEVUSU" intro="Resmî kayıt, hesap veya ödeme adımında nerede takıldığını yaz; uygun zamanda seni arayalım ya da e-postayla dönelim." submitLabel="RANDEVU TALEP ET" />
        <aside className="self-start rounded-xl bg-ink p-6 text-white lg:sticky lg:top-28"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-brand">ÜCRET ŞEFFAFLIĞI</p><p className="mt-3 font-display text-[28px] font-bold">{RECF_TEAM_FEE.label}</p><p className="mt-2 text-sm leading-relaxed text-white/75">{RECF_TEAM_FEE.season} RECF resmî takım kayıt ücreti, takım başına. Takım Bursu ve kurumsal paket seçenekleri için bize ulaşın.</p><a href={RECF_TEAM_FEE.source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-cyan-brand underline">Kaynak: RECF SSS<span className="sr-only"> (yeni sekmede açılır)</span></a></aside>
      </section>
    </div>
  </div>;
}
