import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getCachedPrograms, getCachedEvents, getCachedNews } from "@/lib/public-cache";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    ["", 1, "daily"], ["/programlar", 0.9, "weekly"], ["/etkinlikler", 0.9, "daily"], ["/kayit", 0.9, "monthly"],
    ["/duyurular", 0.8, "daily"], ["/takimlar", 0.7, "weekly"], ["/dokumanlar", 0.7, "weekly"], ["/hakkimizda", 0.6, "monthly"],
    ["/rehber/takim-kaydi", 0.6, "monthly"], ["/rehber/mentor", 0.6, "monthly"], ["/galeri", 0.5, "weekly"],
    ["/kvkk", 0.3, "yearly"], ["/gizlilik", 0.3, "yearly"], ["/kullanim-kosullari", 0.3, "yearly"], ["/cerez-politikasi", 0.3, "yearly"],
  ].map(([p, pr, f]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: f as any, priority: pr as number }));
  const [programs, events, news] = await Promise.all([getCachedPrograms(), getCachedEvents(), getCachedNews()]);
  const dyn: MetadataRoute.Sitemap = [
    ...(programs as any[]).map(p => ({ url: `${SITE_URL}/programlar/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.85 })),
    ...(events as any[]).filter(e => e?.slug).map(e => ({ url: `${SITE_URL}/etkinlikler/${e.slug}`, lastModified: e.updated_at ? new Date(e.updated_at) : now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(news as any[]).filter(n => n?.slug).map(n => ({ url: `${SITE_URL}/duyurular/${n.slug}`, lastModified: n.date ? new Date(n.date) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
  return [...statics, ...dyn];
}
