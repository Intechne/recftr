import { notFound } from "next/navigation";
import Image from "next/image";
import { optimizable } from "@/components/public/CmsImage";
import SitePageView from "@/components/public/SitePageView";
import LeadForm from "@/components/public/LeadForm";
import { getCachedPartners, getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("is-birlikleri");

type Partner = { id: number; name: string; logo_url: string; website_url: string; tier: string };

export default async function IsBirlikleriPage() {
  const [page, partners] = await Promise.all([getSitePage("is-birlikleri"), getCachedPartners() as Promise<Partner[]>]);
  if (!page) notFound();
  return <SitePageView kicker={page.kicker} title={page.title} body={page.body} action={{ label: "İLETİŞİME GEÇ", href: "#iletisim" }}>
    {partners.length > 0 && <section className="border-b border-ink/15 py-12" aria-labelledby="partners-title">
      <p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">PARTNERLER</p>
      <h2 id="partners-title" className="mt-2 font-display text-[26px] font-bold sm:text-[30px]">SAHAYI BİRLİKTE KURUYORUZ.</h2>
      <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{partners.map(partner => { const logo = optimizable(partner.logo_url) ? <Image src={partner.logo_url} alt={`${partner.name} logosu`} width={240} height={120} sizes="(min-width:1024px) 18vw, (min-width:640px) 30vw, 45vw" className="h-16 w-auto max-w-full object-contain" /> : <img src={partner.logo_url} alt={`${partner.name} logosu`} loading="lazy" className="h-16 w-auto max-w-full object-contain" />; return <li key={partner.id} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white p-4 text-center">{partner.website_url ? <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">{logo}<span className="sr-only"> (yeni sekmede açılır)</span></a> : logo}{partner.tier && <span className="font-display text-[10px] font-bold tracking-[1.5px] text-ink/65">{partner.tier.toLocaleUpperCase("tr-TR")}</span>}</li>; })}</ul>
    </section>}
    <section id="iletisim" className="scroll-mt-28 grid gap-7 pt-12 lg:grid-cols-[1.6fr_.8fr]">
      <LeadForm kind="isbirligi" title="İŞ BİRLİĞİ İLETİŞİM FORMU" intro="Kurumunuzu ve hedeflerinizi kısaca anlatın; Takım Bursu ve sponsorluk seçeneklerini birlikte planlayalım." submitLabel="GÖNDER" />
      <aside className="self-start rounded-xl border-2 border-ink bg-white p-6 lg:sticky lg:top-28"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">TAKIM BURSU</p><p className="mt-3 font-display text-[20px] font-bold leading-snug">Bir takımın sezonunu siz başlatın.</p><p className="mt-3 text-sm leading-relaxed text-ink/65">Desteklemek istediğiniz okul, bölge veya program varsa formda belirtin; size uygun modeli birlikte kuralım.</p></aside>
    </section>
  </SitePageView>;
}
