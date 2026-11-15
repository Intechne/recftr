// Tek kaynak: doğrulanmış RECF bilgileri ve public sitede kullanılan yapılandırılabilir eşikler.
// Buradaki her tarih/rakam bir kaynağa bağlıdır. Teyit bekleyen bilgi bu dosyaya yazılmaz;
// CMS'te taslak olarak girilir.

export const RECF_EVENTS_URL = "https://www.recfevents.org/";

export const RECF_SOURCES = {
  faq: "https://recf.org/faq/",
  fee: "https://recf.org/faq/what-is-the-team-registration-fee-for-the-2026-2027-recf-robotics-competition-season/",
  droneFee: "https://kb.roboticseducation.org/hc/en-us/articles/41294850729623",
  pathway: "https://recf.org/the-future-of-stem-competition-starts-here-introducing-recf-robotics/",
  worldChampionship: "https://recf.org/recf-world-championship/",
  judging: "https://kb.roboticseducation.org/hc/en-us/articles/33153476484375-Robotics-Guide-to-Judging-Official-Judging-Resources",
} as const;

export const SEASON = "2026–27";

/**
 * 2026–27 takım kayıt ücreti programa göre değişir (teyit: 16 Kasım 2026).
 * - RECF Robotics (Engage, Achieve, Inspire): 175 USD — recf.org/faq
 * - Drone programları (ADC, ADC Pro): 200 USD — RECF KB "What to Buy, Where to Buy it, and How to Budget"
 * Ödeme her programda RECFEvents.org üzerinden yapılır.
 */
export const RECF_FEES = {
  robotics: { amount: 175, label: "175 USD", programs: ["engage", "achieve", "inspire"], name: "Engage, Achieve ve Inspire", nameEn: "Engage, Achieve and Inspire", source: RECF_SOURCES.fee },
  drones: { amount: 200, label: "200 USD", programs: ["adc", "adc-pro"], name: "ADC ve ADC Pro", nameEn: "ADC and ADC Pro", source: RECF_SOURCES.droneFee },
} as const;
export type FeeGroup = keyof typeof RECF_FEES;
export const feeGroupFor = (program?: string | null): FeeGroup | null =>
  (RECF_FEES.robotics.programs as readonly string[]).includes(String(program)) ? "robotics" : (RECF_FEES.drones.programs as readonly string[]).includes(String(program)) ? "drones" : null;
/** "Engage, Achieve ve Inspire için 175 USD; ADC ve ADC Pro için 200 USD" */
export const FEE_SUMMARY = `${RECF_FEES.robotics.name} için ${RECF_FEES.robotics.label}; ${RECF_FEES.drones.name} için ${RECF_FEES.drones.label}`;
export const FEE_SUMMARY_EN = `${RECF_FEES.robotics.label} for ${RECF_FEES.robotics.nameEn}; ${RECF_FEES.drones.label} for ${RECF_FEES.drones.nameEn}`;

/**
 * RECF World Championship 2027 — St. Louis.
 * Resmî kaynaklar tarihte çelişiyor (16 Kasım 2026): recf.org etkinlik sayfası, recf.org/faq ve
 * recfevents.org 25 Nisan – 7 Mayıs 2027; RECF KB sezon güncellemeleri ve ADC SSS 27 Nisan – 6 Mayıs 2027.
 * Çelişki giderilene kadar yalnız tüm kaynakların ortak bilgisi gösterilir. Kesin tarih CMS →
 * Site Ayarları → "World Championship tarih metni" alanından tek yerden girilir.
 */
export const WORLD_CHAMPIONSHIP = {
  name: "RECF STEM World Championship",
  city: "St. Louis, ABD",
  cityEn: "St. Louis, USA",
  label: "Nisan – Mayıs 2027",
  labelEn: "April – May 2027",
  source: RECF_SOURCES.worldChampionship,
} as const;
export type WorldChampionshipInfo = { name: string; city: string; cityEn: string; label: string; labelEn: string; source: string };
/** CMS ayarı (wc_date_label / wc_date_label_en) varsa onu, yoksa ortak bilgiyi kullanır. */
export function worldChampionship(settings: Record<string, unknown> = {}): WorldChampionshipInfo {
  const tr = String(settings.wc_date_label ?? "").trim(), en = String(settings.wc_date_label_en ?? "").trim();
  return { ...WORLD_CHAMPIONSHIP, label: tr && !hasPlaceholder(tr) ? tr : WORLD_CHAMPIONSHIP.label, labelEn: en && !hasPlaceholder(en) ? en : WORLD_CHAMPIONSHIP.labelEn };
}

/** RECF onayıyla gösterilen resmî temsilcilik ibaresi (CMS: recf_representation_approved). */
export const REPRESENTATION_LINE = "Official RECF International Representative";

export const FOUNDING_100 = { target: 100, defaultMinDisplay: 10 } as const;
export const TEAM_MAP_DEFAULT_MIN_TEAMS = 25;

/** CMS ayarındaki sayıyı güvenle okur; geçersiz değerde varsayılana döner. */
export function settingNumber(raw: unknown, fallback: number, min = 0, max = 100000) {
  const text = String(raw ?? "").trim();
  if (!text) return fallback;
  const n = Number(text);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

/** Ayar "true" ise açık; boş/"false" ise kapalı (opt-in bayraklar için). */
export function settingFlag(raw: unknown) {
  return String(raw ?? "").trim() === "true";
}

/** Bir metinde production'a çıkmaması gereken yer tutucu var mı? */
export function hasPlaceholder(text: unknown) {
  const value = String(text ?? "");
  // Köşeli parantezli işaretler ve büyük harfli "TEYİT" yer tutucudur; cümle içindeki "teyit" değildir.
  return /\[[^\]]*(?:TEY[İI]T|TBD|TODO)[^\]]*\]|lorem ipsum/i.test(value) || /(?:^|[^A-Za-zÇĞİÖŞÜçğıöşü])TEY[İI]T(?![A-Za-zÇĞİÖŞÜçğıöşü])/.test(value);
}
