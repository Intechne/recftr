import { RECF_EVENTS_URL, RECF_FEES, SEASON, WORLD_CHAMPIONSHIP, type WorldChampionshipInfo } from "@/lib/site-config";

/**
 * Sezon rotası kilometre taşı. CMS'te `season_route` ayarında JSON dizi olarak tutulur.
 * - month: rozet satırı (ör. "NİSAN 2027", "ŞİMDİ")
 * - date / end_date: ISO tarih (YYYY-MM-DD); geçmişte kalan adım otomatik "tamamlandı" olur
 * - status: "confirmed" (teyitli) | "tbc" (tarih teyit bekleniyor)
 * - published: yalnız true olan adımlar public sitede görünür. Eski biçimdeki (yalnız ay etiketi
 *   olan) adımlar taslak sayılır; editör tarihleri girip yayına alana kadar görünmez.
 */
export type RouteStep = {
  month: string;
  label: string;
  done: boolean;
  date?: string;
  end_date?: string;
  date_label?: string;
  status?: "confirmed" | "tbc";
  published?: boolean;
  link?: string;
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Doğrulanmış varsayılan rota. World Championship tarihi tek kaynaktan (CMS / site-config) gelir. */
export function verifiedRoute(wc: WorldChampionshipInfo = WORLD_CHAMPIONSHIP): RouteStep[] {
  return [
    { month: "ŞİMDİ", label: `${SEASON} resmî takım kaydı · RECFEvents.org`, done: false, status: "confirmed", published: true, link: RECF_EVENTS_URL, date_label: `Kayıt ücreti ${RECF_FEES.robotics.label} (robotik) · ${RECF_FEES.drones.label} (drone)` },
    { month: "2027", label: `${wc.name} · ${wc.city}`, done: false, status: "confirmed", published: true, date_label: wc.label, link: wc.source },
  ];
}
export const VERIFIED_ROUTE: RouteStep[] = verifiedRoute();

/** CMS'te "önerilen kilometre taşları" ile eklenen adımlar. Teyit bekleyenler taslak gelir. */
export const SUGGESTED_ROUTE: RouteStep[] = [
  VERIFIED_ROUTE[0],
  { month: "", label: "RECF Türkiye Lansman Etkinliği", done: false, status: "tbc", published: false },
  { month: "", label: "İlk RECF Türkiye Turnuvası", done: false, status: "tbc", published: false },
  { month: "", label: "Bölge Turnuvaları", done: false, status: "tbc", published: false },
  { month: "", label: "Türkiye Şampiyonası", done: false, status: "tbc", published: false },
  VERIFIED_ROUTE[1],
];

const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export function normalizeRouteStep(raw: any): RouteStep | null {
  if (!raw || typeof raw !== "object") return null;
  const step: RouteStep = {
    month: text(raw.month, 24),
    label: text(raw.label, 120),
    done: !!raw.done,
    status: raw.status === "tbc" ? "tbc" : raw.status === "confirmed" ? "confirmed" : undefined,
    published: raw.published === true,
  };
  const date = text(raw.date, 10), end = text(raw.end_date, 10), dateLabel = text(raw.date_label, 80), link = text(raw.link, 500);
  if (ISO_DAY.test(date)) step.date = date;
  if (ISO_DAY.test(end)) step.end_date = end;
  if (dateLabel) step.date_label = dateLabel;
  if (/^https:\/\//.test(link) || (link.startsWith("/") && !link.startsWith("//"))) step.link = link;
  return step.label ? step : null;
}

export function parseRouteSetting(raw?: string): RouteStep[] {
  try {
    const data = JSON.parse(raw || "[]");
    return Array.isArray(data) ? data.map(normalizeRouteStep).filter((x): x is RouteStep => !!x) : [];
  } catch {
    return [];
  }
}

const istanbulDay = (now: number) => new Date(now).toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

/** Public sitede gösterilecek rota: yalnız yayınlanmış adımlar; yeterli adım yoksa doğrulanmış varsayılan. */
export function publicRoute(raw?: string, now = Date.now(), wc: WorldChampionshipInfo = WORLD_CHAMPIONSHIP): RouteStep[] {
  const steps = parseRouteSetting(raw).filter(step => step.published && step.month && step.label);
  const base = steps.length >= 2 ? steps : verifiedRoute(wc);
  const today = istanbulDay(now);
  return base.map(step => ({ ...step, done: step.done || (!!(step.end_date || step.date) && (step.end_date || step.date)! < today) }));
}
