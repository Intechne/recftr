// ── SEO merkezi yapılandırma ──
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://recfturkiye.com").replace(/\/$/, "");
export const SITE_NAME = "RECF Türkiye";
export const ORG = {
  name: "RECF Türkiye",
  legalName: "Intechne Teknoloji A.Ş.",
  url: SITE_URL,
  email: "info@recfturkiye.org",
  teamEmail: "takim@recfturkiye.org",
  address: { locality: "Pendik", region: "İstanbul", country: "TR", street: "Teknopark İstanbul" },
  sameAs: ["https://www.instagram.com/recfturkiye", "https://www.youtube.com/@recfturkiye", "https://www.linkedin.com/company/recfturkiye"],
  parent: { name: "Robotics Education & Competition Foundation", url: "https://recf.org" },
};
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : "/" + path}`;

export function pageMeta(opts: { title: string; description: string; path: string; image?: string; type?: "website" | "article"; noIndex?: boolean }) {
  const url = abs(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1, "max-video-preview": -1 },
    openGraph: { title: opts.title, description: opts.description, url, siteName: SITE_NAME, locale: "tr_TR", type: opts.type ?? "website", images: opts.image ? [{ url: opts.image, width: 1600, height: 900 }] : undefined },
    twitter: { card: "summary_large_image" as const, title: opts.title, description: opts.description, images: opts.image ? [opts.image] : undefined },
  };
}
export const organizationLd = () => ({
  "@context": "https://schema.org", "@type": "Organization",
  "@id": abs("/#organization"), name: ORG.name, legalName: ORG.legalName, url: ORG.url,
  logo: abs("/logos/recf-turkiye.svg"), email: ORG.email, sameAs: ORG.sameAs,
  address: { "@type": "PostalAddress", streetAddress: ORG.address.street, addressLocality: ORG.address.locality, addressRegion: ORG.address.region, addressCountry: ORG.address.country },
  parentOrganization: { "@type": "Organization", name: ORG.parent.name, url: ORG.parent.url },
  contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: ORG.teamEmail, availableLanguage: ["tr", "en"] }],
});
export const websiteLd = () => ({
  "@context": "https://schema.org", "@type": "WebSite", "@id": abs("/#website"),
  url: SITE_URL, name: SITE_NAME, inLanguage: "tr-TR", publisher: { "@id": abs("/#organization") },
  potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: abs("/takimlar?q={search_term_string}") }, "query-input": "required name=search_term_string" },
});
export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});
export const eventLd = (e: any) => ({
  "@context": "https://schema.org", "@type": "Event", name: e.title, description: e.excerpt || undefined,
  url: abs(`/etkinlikler/${e.slug}`), image: e.cover_url || undefined,
  startDate: e.start_at || undefined, endDate: e.end_at || undefined,
  eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: e.venue || e.city, address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: "TR" } },
  organizer: { "@id": abs("/#organization") },
  offers: { "@type": "Offer", url: abs("/kayit"), availability: "https://schema.org/InStock", price: "0", priceCurrency: "TRY" },
});
export const articleLd = (n: any) => ({
  "@context": "https://schema.org", "@type": "NewsArticle", headline: n.title, description: n.excerpt || undefined,
  url: abs(`/duyurular/${n.slug}`), image: n.cover_url || undefined, datePublished: n.date || n.published_at || undefined,
  dateModified: n.updated_at || n.date || undefined, inLanguage: "tr-TR",
  author: { "@id": abs("/#organization") }, publisher: { "@id": abs("/#organization") },
});
