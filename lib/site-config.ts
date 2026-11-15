// Tek kaynak: doğrulanmış RECF bilgileri ve public sitede kullanılan yapılandırılabilir eşikler.
// Buradaki her tarih/rakam bir kaynağa bağlıdır. Teyit bekleyen bilgi bu dosyaya yazılmaz;
// CMS'te taslak olarak girilir.

export const RECF_EVENTS_URL = "https://www.recfevents.org/";

export const RECF_SOURCES = {
  faq: "https://recf.org/faq/",
  fee: "https://recf.org/faq/what-is-the-team-registration-fee-for-the-2026-2027-recf-robotics-competition-season/",
  pathway: "https://recf.org/the-future-of-stem-competition-starts-here-introducing-recf-robotics/",
} as const;

/** 2026–27 RECF takım kayıt ücreti — resmî kayıt RECFEvents.org üzerinden. */
export const RECF_TEAM_FEE = { amount: 175, currency: "USD", label: "175 USD", season: "2026–27", source: RECF_SOURCES.fee } as const;

/** RECF STEM World Championship 2027. */
export const WORLD_CHAMPIONSHIP = {
  name: "RECF STEM World Championship",
  city: "St. Louis, ABD",
  cityEn: "St. Louis, USA",
  start: "2027-04-27",
  end: "2027-05-06",
  label: "27 Nisan – 6 Mayıs 2027",
  labelEn: "April 27 – May 6, 2027",
  source: RECF_SOURCES.faq,
} as const;

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
