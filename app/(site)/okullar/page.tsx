import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import LeadForm from "@/components/public/LeadForm";
import { getSitePage, getWorldChampionship } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { provinces } from "@/lib/locations";
import { RECF_FEES, SEASON } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("okullar");

export default async function OkullarPage() {
  const [page, wc] = await Promise.all([getSitePage("okullar"), getWorldChampionship()]);
  if (!page) notFound();
  return <SitePageView kicker={page.kicker} title={page.title} body={page.body} action={{ label: "RANDEVU TALEP ET", href: "#randevu" }}
    aside={<div className="self-end rounded-xl border-2 border-ink bg-white p-6 shadow-plate shadow-cyan-brand/40"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">SEZON {SEASON}</p><dl className="mt-4 space-y-4">{[["RESMÎ KAYIT", `RECFEvents.org · takım başına ${RECF_FEES.robotics.label} (robotik) / ${RECF_FEES.drones.label} (drone)`], ["SEZONUN ZİRVESİ", `${wc.name} · ${wc.label} · ${wc.city}`], ["DESTEK", "Kampüs içi lig, eğitim ve kurumsal paketler"]].map(([term, value]) => <div key={term} className="border-b border-ink/10 pb-4 last:border-0 last:pb-0"><dt className="font-display text-[11px] font-bold tracking-[1.5px] text-ink/65">{term}</dt><dd className="mt-1 font-display text-[15px] font-semibold text-ink">{value}</dd></div>)}</dl></div>}>
    <section id="randevu" className="scroll-mt-28 grid gap-7 pt-12 lg:grid-cols-[1.6fr_.8fr]">
      <LeadForm kind="okul_randevu" title="RANDEVU TALEBİ" intro="Okulunuzun ihtiyaçlarını birlikte konuşalım. Formu doldurun; ekibimiz uygun görüşme zamanı için sizinle iletişime geçsin." provinces={provinces()} submitLabel="RANDEVU TALEP ET" />
      <aside className="self-start rounded-xl bg-ink p-6 text-white lg:sticky lg:top-28"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-brand">GÖRÜŞMEDE NE KONUŞURUZ?</p><ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/75"><li>Okulunuza uygun programlar ve takım sayısı</li><li>Kampüs içi lig ve sezon takvimi</li><li>Öğretmen ve antrenör eğitimi</li><li>Kurumsal paket ve Takım Bursu seçenekleri</li></ul></aside>
    </section>
  </SitePageView>;
}
