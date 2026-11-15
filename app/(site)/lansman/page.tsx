import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import LeadForm from "@/components/public/LeadForm";
import { getCachedEvent, getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { DATE_TBC_STATUS } from "@/lib/public-content";
import { LAUNCH_EVENT_SLUG } from "@/lib/site-pages";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("lansman");


export default async function LansmanPage() {
  const page = await getSitePage("lansman");
  if (!page) notFound();
  const event: any = await getCachedEvent(LAUNCH_EVENT_SLUG);
  const confirmed = event && event.status !== DATE_TBC_STATUS;
  const facts = confirmed ? [["TARİH", event.date_label], ["MEKÂN", [event.venue, event.city].filter(Boolean).join(" · ")]].filter(([, value]) => value) : [];
  return <SitePageView kicker={page.kicker} title={page.title} body={page.body} action={{ label: "KATILIM FORMU", href: "#katilim" }}
    aside={facts.length ? <div className="self-end rounded-xl border-2 border-ink bg-white p-6 shadow-plate shadow-cyan-brand/40"><dl className="space-y-4">{facts.map(([term, value]) => <div key={term}><dt className="font-display text-[11px] font-bold tracking-[1.5px] text-ink/65">{term}</dt><dd className="mt-1 font-display text-[18px] font-bold text-ink">{value}</dd></div>)}</dl></div> : undefined}>
    <section id="katilim" className="scroll-mt-28 pt-12 lg:max-w-3xl">
      <LeadForm kind="lansman_katilim" title="KATILIM FORMU" intro="Yerinizi ayırmak için formu doldurun; katılım bilgileri e-posta ile paylaşılacak." submitLabel="KATILIMIMI BİLDİR" />
    </section>
  </SitePageView>;
}
