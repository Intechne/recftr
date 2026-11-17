import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import { getCachedPublicSettings, getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { REPRESENTATION_LINE } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("en-about");

export default async function EnglishAbout() {
  const [page, settings] = await Promise.all([getSitePage("en-about"), getCachedPublicSettings() as Promise<Record<string, string>>]);
  if (!page) notFound();
  const email = settings.contact_info || PUBLIC_CONTACT.support;
  return <SitePageView lang="en" kicker={page.kicker} title={page.title} body={page.body}>
    <section className="mt-12 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border-2 border-ink bg-white p-6"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">CONTACT</p><a href={`mailto:${email}`} className="mt-3 block break-all font-display text-[18px] font-bold text-ink underline decoration-ink/25 underline-offset-4">{email}</a></div>
      {settings.recf_representation_approved === "true" && <div className="rounded-xl bg-ink p-6"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-brand">RECF</p><p className="mt-3 font-display text-[18px] font-bold text-white">{REPRESENTATION_LINE}</p></div>}
    </section>
  </SitePageView>;
}
