import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import JsonLd from "@/components/seo/JsonLd";
import { getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { faqLd } from "@/lib/seo";
import { pageFaqs, parsePageBody, plainText } from "@/lib/site-pages";
import { SafeLink } from "@/components/public/RichText";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("sss");

export default async function SssPage() {
  const page = await getSitePage("sss");
  if (!page) notFound();
  const faqs = pageFaqs(parsePageBody(page.body)).map(item => ({ q: plainText(item.q), a: plainText(item.a) }));
  return <>
    {faqs.length > 0 && <JsonLd data={faqLd(faqs)} />}
    <SitePageView kicker={page.kicker} title={page.title} body={page.body}>
      <section className="mt-12 flex flex-col gap-5 rounded-xl bg-ink px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-brand">CEVABINI BULAMADIN MI?</p><p className="mt-2 font-display text-[20px] font-bold text-white">Ekibimiz yardımcı olmaya hazır.</p></div>
        <div className="flex flex-col gap-3 min-[460px]:flex-row"><SafeLink href="/hakkimizda#iletisim" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink">BİZE YAZ</SafeLink><SafeLink href="/kayit" className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/40 px-5 py-3 font-display text-[13px] font-bold text-white">TAKIMINI BAŞVUR →</SafeLink></div>
      </section>
    </SitePageView>
  </>;
}
