import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { LOCALE_PAIRS } from "@/lib/i18n";
import { getCachedPrograms, getCachedEvents, getCachedNews, getSitePage } from "@/lib/public-cache";
import { LEGAL_VERSION } from "@/lib/site-config";
export const revalidate = 3600;

const STATIC: Array<[path: string, priority: number, frequency: MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["", 1, "daily"], ["/programlar", 0.9, "weekly"], ["/etkinlikler", 0.9, "daily"], ["/kayit", 0.9, "monthly"],
  ["/okullar", 0.85, "monthly"], ["/veliler", 0.85, "monthly"], ["/sss", 0.8, "monthly"], ["/is-birlikleri", 0.7, "monthly"],
  ["/duyurular", 0.8, "daily"], ["/takimlar", 0.7, "weekly"], ["/dokumanlar", 0.7, "weekly"], ["/hakkimizda", 0.6, "monthly"],
  ["/rehber/takim-kaydi", 0.8, "monthly"], ["/rehber/mentor", 0.6, "monthly"], ["/planlama-komitesi", 0.6, "monthly"],
  ["/en", 0.6, "monthly"], ["/en/programs", 0.5, "monthly"], ["/en/about", 0.5, "monthly"], ["/en/faq", 0.5, "monthly"], ["/gonullu", 0.6, "monthly"],
  ["/hukuki-belgeler", 0.4, "yearly"], ["/acik-riza", 0.3, "yearly"], ["/katilim-onami", 0.3, "yearly"], ["/kvkk", 0.3, "yearly"], ["/gizlilik", 0.3, "yearly"], ["/kullanim-kosullari", 0.3, "yearly"], ["/cerez-politikasi", 0.3, "yearly"],
];

function alternates(path: string) {
  const clean = path || "/";
  const pair = LOCALE_PAIRS.find(([tr, en]) => tr === clean || en === clean);
  return pair ? { languages: { "tr-TR": `${SITE_URL}${pair[0] === "/" ? "" : pair[0]}`, en: `${SITE_URL}${pair[1]}` } } : undefined;
}

const LEGAL = new Set(["/hukuki-belgeler", "/acik-riza", "/katilim-onami", "/kvkk", "/gizlilik", "/kullanim-kosullari", "/cerez-politikasi"]);
const date = (value: unknown) => { const d = value ? new Date(String(value)) : null; return d && !Number.isNaN(d.getTime()) ? d : undefined; };
const latest = (...values: Array<Date | undefined>) => values.filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0];

// lastmod yalnız gerçek güncelleme tarihi bilinen sayfalarda verilir; bilinmiyorsa alan boş bırakılır.
// Taslak / yayından kaldırılmış kayıtlar listelere hiç girmez (public-cache yalnız yayınlanmışları döndürür).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, events, news, launch] = await Promise.all([getCachedPrograms(), getCachedEvents(), getCachedNews(), getSitePage("lansman")]);
  const programDates = (programs as any[]).map(p => date(p.updated_at));
  const eventDates = (events as any[]).map(e => date(e.updated_at));
  const newsDates = (news as any[]).map(n => date(n.updated_at) || date(n.date));
  const known: Record<string, Date | undefined> = {
    "": latest(...newsDates, ...eventDates), "/programlar": latest(...programDates), "/etkinlikler": latest(...eventDates), "/duyurular": latest(...newsDates),
  };
  const statics: MetadataRoute.Sitemap = [...STATIC, ...(launch ? [["/lansman", 0.8, "weekly"] as (typeof STATIC)[number]] : [])]
    .map(([p, priority, changeFrequency]) => ({ url: `${SITE_URL}${p}`, lastModified: LEGAL.has(p) ? new Date(LEGAL_VERSION.effectiveDate) : known[p], changeFrequency, priority, alternates: alternates(p) }));
  const dyn: MetadataRoute.Sitemap = [
    ...(programs as any[]).map(p => ({ url: `${SITE_URL}/programlar/${p.slug}`, lastModified: date(p.updated_at), changeFrequency: "weekly" as const, priority: 0.85 })),
    ...(events as any[]).filter(e => e?.slug).map(e => ({ url: `${SITE_URL}/etkinlikler/${e.slug}`, lastModified: date(e.updated_at), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(news as any[]).filter(n => n?.slug).map(n => ({ url: `${SITE_URL}/duyurular/${n.slug}`, lastModified: date(n.updated_at) || date(n.date), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
  return [...statics, ...dyn];
}
