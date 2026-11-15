import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { LOCALE_PAIRS } from "@/lib/i18n";
import { getCachedPrograms, getCachedEvents, getCachedNews, getSitePage } from "@/lib/public-cache";
export const revalidate = 3600;

const STATIC: Array<[path: string, priority: number, frequency: MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["", 1, "daily"], ["/programlar", 0.9, "weekly"], ["/etkinlikler", 0.9, "daily"], ["/kayit", 0.9, "monthly"],
  ["/okullar", 0.85, "monthly"], ["/veliler", 0.85, "monthly"], ["/sss", 0.8, "monthly"], ["/is-birlikleri", 0.7, "monthly"],
  ["/duyurular", 0.8, "daily"], ["/takimlar", 0.7, "weekly"], ["/dokumanlar", 0.7, "weekly"], ["/hakkimizda", 0.6, "monthly"],
  ["/rehber/takim-kaydi", 0.8, "monthly"], ["/rehber/mentor", 0.6, "monthly"], ["/galeri", 0.5, "weekly"], ["/planlama-komitesi", 0.6, "monthly"],
  ["/en", 0.6, "monthly"], ["/en/about", 0.5, "monthly"], ["/en/faq", 0.5, "monthly"],
  ["/hukuki-belgeler", 0.4, "yearly"], ["/acik-riza", 0.3, "yearly"], ["/katilim-onami", 0.3, "yearly"], ["/kvkk", 0.3, "yearly"], ["/gizlilik", 0.3, "yearly"], ["/kullanim-kosullari", 0.3, "yearly"], ["/cerez-politikasi", 0.3, "yearly"],
];

function alternates(path: string) {
  const clean = path || "/";
  const pair = LOCALE_PAIRS.find(([tr, en]) => tr === clean || en === clean);
  return pair ? { languages: { "tr-TR": `${SITE_URL}${pair[0] === "/" ? "" : pair[0]}`, en: `${SITE_URL}${pair[1]}` } } : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [programs, events, news, launch] = await Promise.all([getCachedPrograms(), getCachedEvents(), getCachedNews(), getSitePage("lansman")]);
  const statics: MetadataRoute.Sitemap = [...STATIC, ...(launch ? [["/lansman", 0.8, "weekly"] as (typeof STATIC)[number]] : [])]
    .map(([p, priority, changeFrequency]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency, priority, alternates: alternates(p) }));
  const dyn: MetadataRoute.Sitemap = [
    ...(programs as any[]).map(p => ({ url: `${SITE_URL}/programlar/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.85 })),
    ...(events as any[]).filter(e => e?.slug).map(e => ({ url: `${SITE_URL}/etkinlikler/${e.slug}`, lastModified: e.updated_at ? new Date(e.updated_at) : now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(news as any[]).filter(n => n?.slug).map(n => ({ url: `${SITE_URL}/duyurular/${n.slug}`, lastModified: n.date ? new Date(n.date) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
  return [...statics, ...dyn];
}
