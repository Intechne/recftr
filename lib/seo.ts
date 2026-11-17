import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { CANONICAL_ORIGIN, DATA_CONTROLLER } from "@/lib/site-config";
import { eventPhase, istanbulIso } from "@/lib/public-content";
// ── SEO merkezi yapılandırma ──
// Kanonik alan adı tek kaynaktan; ortam değişkeni farklı bir alan adı veremez (denetim 2026-11, madde 24).
export const SITE_URL = CANONICAL_ORIGIN;
export const SITE_NAME = "RECF Türkiye";
export const ORG = {
  name: "RECF Türkiye",
  legalName: DATA_CONTROLLER.shortName,
  url: SITE_URL,
  email: PUBLIC_CONTACT.support,
  eventEmail: PUBLIC_CONTACT.events,
  address: { locality: "Pendik", region: "İstanbul", country: "TR", street: DATA_CONTROLLER.address },
  // Sosyal hesaplar CMS ayarlarından gelir (organizationLd(sameAs)); doğrulanmamış hesap yazılmaz.
  sameAs: [] as string[],
  parent: { name: "Robotics Education & Competition Foundation", url: "https://recf.org" },
};
export const DEFAULT_OG_IMAGE = "/og/recf-turkiye-og.png";
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : "/" + path}`;

export function pageMeta(opts: { title: string; description: string; path: string; image?: string; type?: "website" | "article"; noIndex?: boolean; lang?: "tr" | "en"; languages?: Record<string, string> }) {
  const url = abs(opts.path);
  // Sayfa kendi görselini vermezse markanın varsayılan paylaşım görseli kullanılır
  // (Next, alt sayfadaki openGraph nesnesini üst düzeyle birleştirmez, tamamen değiştirir).
  const image = opts.image || abs(DEFAULT_OG_IMAGE);
  const images = opts.image ? [{ url: image, width: 1600, height: 900 }] : [{ url: image, width: 1200, height: 630, alt: "RECF Türkiye" }];
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url, ...(opts.languages ? { languages: opts.languages } : {}) },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 },
    openGraph: { title: opts.title, description: opts.description, url, siteName: SITE_NAME, locale: opts.lang === "en" ? "en_US" : "tr_TR", type: opts.type ?? "website", images },
    twitter: { card: "summary_large_image" as const, title: opts.title, description: opts.description, images: [image] },
  };
}
export const organizationLd = (sameAs: string[] = ORG.sameAs) => ({
  "@context": "https://schema.org", "@type": "Organization",
  "@id": abs("/#organization"), name: ORG.name, legalName: ORG.legalName, url: ORG.url,
  logo: abs("/logos/recf-turkiye-logo.png"), email: ORG.email, ...(sameAs.length ? { sameAs } : {}),
  address: { "@type": "PostalAddress", streetAddress: ORG.address.street, addressLocality: ORG.address.locality, addressRegion: ORG.address.region, addressCountry: ORG.address.country },
  parentOrganization: { "@type": "Organization", name: ORG.parent.name, url: ORG.parent.url },
  contactPoint: [
    { "@type": "ContactPoint", contactType: "customer support", email: ORG.email, availableLanguage: ["tr", "en"] },
    { "@type": "ContactPoint", contactType: "event registration", email: ORG.eventEmail, availableLanguage: ["tr", "en"] },
  ],
});
export const websiteLd = () => ({
  "@context": "https://schema.org", "@type": "WebSite", "@id": abs("/#website"),
  url: SITE_URL, name: SITE_NAME, inLanguage: ["tr-TR", "en"], publisher: { "@id": abs("/#organization") },
});
export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});
/** schema.org Event. Tarihi teyit edilmemiş etkinlik için `null` döner (startDate zorunlu alandır). */
export const eventLd = (e: any) => {
  const start = e?.event_start ? new Date(e.event_start) : null;
  if (!start || Number.isNaN(start.getTime()) || e.date_tbc) return null;
  const end = e.event_end ? new Date(e.event_end) : null;
  const registration = typeof e.registration_url === "string" && /^https:\/\//.test(e.registration_url) ? e.registration_url : "";
  return {
    "@context": "https://schema.org", "@type": "Event", name: e.title, description: e.excerpt || undefined,
    url: abs(`/etkinlikler/${e.slug}`), image: e.cover_url ? [e.cover_url] : [abs(DEFAULT_OG_IMAGE)],
    // Sayfadaki tarih etiketiyle aynı alanlardan (event_start/event_end), Europe/Istanbul saat diliminde.
    startDate: istanbulIso(start), endDate: end && !Number.isNaN(end.getTime()) ? istanbulIso(end) : undefined,
    // Planlandığı gibi gerçekleşen geçmiş etkinlikler için de schema.org'un önerdiği değer EventScheduled'dir.
    eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.venue || e.city || "Türkiye", address: { "@type": "PostalAddress", ...(e.city ? { addressLocality: e.city } : {}), addressCountry: "TR" } },
    organizer: { "@type": "Organization", name: ORG.name, url: ORG.url },
    ...(registration && eventPhase(e) !== "past" ? { offers: { "@type": "Offer", url: registration, availability: "https://schema.org/InStock" } } : {}),
  };
};
/** schema.org FAQPage. */
export const faqLd = (items: { q: string; a: string }[], lang: "tr" | "en" = "tr") => ({
  "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang === "en" ? "en" : "tr-TR",
  mainEntity: items.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
});
export const articleLd = (n: any) => ({
  "@context": "https://schema.org", "@type": "NewsArticle", headline: n.title, description: n.excerpt || undefined,
  url: abs(`/duyurular/${n.slug}`), image: n.cover_url || undefined, datePublished: n.date || n.published_at || undefined,
  dateModified: n.updated_at || n.date || undefined, inLanguage: "tr-TR",
  author: { "@id": abs("/#organization") }, publisher: { "@id": abs("/#organization") },
});
