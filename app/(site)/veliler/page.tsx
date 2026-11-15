import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import { getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { SafeLink } from "@/components/public/RichText";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("veliler");

export default async function VelilerPage() {
  const page = await getSitePage("veliler");
  if (!page) notFound();
  return <SitePageView kicker={page.kicker} title={page.title} body={page.body} action={{ label: "SIK SORULAN SORULAR", href: "/sss" }}>
    <section className="mt-12 flex flex-col gap-5 rounded-xl bg-ink px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-brand">SORUNUZ MU VAR?</p><p className="mt-2 font-display text-[20px] font-bold text-white">Okulunuzda takım yoksa birlikte başlayalım.</p></div>
      <div className="flex flex-col gap-3 min-[460px]:flex-row"><SafeLink href="/hakkimizda#iletisim" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink">BİZE YAZIN</SafeLink><SafeLink href="/okullar#randevu" className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/40 px-5 py-3 font-display text-[13px] font-bold text-white">OKULUNUZU YÖNLENDİRİN →</SafeLink></div>
    </section>
  </SitePageView>;
}
