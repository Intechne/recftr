import { notFound } from "next/navigation";
import SitePageView from "@/components/public/SitePageView";
import JsonLd from "@/components/seo/JsonLd";
import { getSitePage } from "@/lib/public-cache";
import { sitePageMetadata } from "@/lib/site-page-meta";
import { faqLd } from "@/lib/seo";
import { pageFaqs, parsePageBody, plainText } from "@/lib/site-pages";

export const dynamic = "force-dynamic";
export const metadata = sitePageMetadata("en-faq");

export default async function EnglishFaq() {
  const page = await getSitePage("en-faq");
  if (!page) notFound();
  const faqs = pageFaqs(parsePageBody(page.body)).map(item => ({ q: plainText(item.q), a: plainText(item.a) }));
  return <>{faqs.length > 0 && <JsonLd data={faqLd(faqs, "en")} />}<SitePageView lang="en" kicker={page.kicker} title={page.title} body={page.body} /></>;
}
