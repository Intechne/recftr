// Tek kaynak: doğrulanmış RECF bilgileri ve public sitede kullanılan yapılandırılabilir eşikler.
// Buradaki her tarih/rakam bir kaynağa bağlıdır. Teyit bekleyen bilgi bu dosyaya yazılmaz;
// CMS'te taslak olarak girilir.

export const RECF_EVENTS_URL = "https://www.recfevents.org/";

export const RECF_SOURCES = {
  faq: "https://recf.org/faq/",
  /** "Which RECF Competition Do I Choose?" — program uygunluğu ve takım büyüklüğü (KB, 11 Ağu 2026) */
  chooseCompetition: "https://kb.roboticseducation.org/hc/en-us/articles/41245156637975",
  /** ADC Pro "Cost: $200 per team" (KB, ADC Pro Team Support & Resources) */
  adcProFee: "https://kb.roboticseducation.org/hc/en-us/articles/41294316276759",
  fee: "https://recf.org/faq/what-is-the-team-registration-fee-for-the-2026-2027-recf-robotics-competition-season/",
  droneFee: "https://kb.roboticseducation.org/hc/en-us/articles/41294850729623",
  pathway: "https://recf.org/the-future-of-stem-competition-starts-here-introducing-recf-robotics/",
  worldChampionship: "https://recf.org/recf-world-championship/",
  judging: "https://kb.roboticseducation.org/hc/en-us/articles/33153476484375-Robotics-Guide-to-Judging-Official-Judging-Resources",
} as const;

export const SEASON = "2026–27";

/**
 * 2026–27 takım kayıt ücreti programa göre değişir (teyit: 17 Kasım 2026).
 * - RECF Robotics (Engage, Achieve, Inspire): 175 USD — recf.org/faq
 * - Aerial Drone Competition: 200 USD — RECF KB "What to Buy, Where to Buy it, and How to Budget"
 *   (ülke kapsamı belirtilmemiş; ayrıca ABD'ye özel KB 22537101027607 aynı tutarı verir)
 * - ADC Pro: RECF Türkiye teyidi gelene kadar tutar yazılmaz; "RECFEvents.org'da gösterilen ücret" gösterilir.
 *   Teyit gelince ADC_PRO_FEE_CONFIRMED değeri girilir (KB 41294316276759: "$200 per team").
 * Uluslararası takımlar için ayrı bir ücret RECF kaynaklarında yayımlanmamıştır.
 * Ödeme her programda RECFEvents.org üzerinden yapılır.
 */
export const ADC_PRO_FEE_CONFIRMED: number | null = null;
export const FEE_ON_RECFEVENTS = "RECFEvents.org'da gösterilen ücret";
export const FEE_ON_RECFEVENTS_EN = "the fee shown on RECFEvents.org";
export const RECF_FEES = {
  robotics: { amount: 175, label: "175 USD", programs: ["engage", "achieve", "inspire"], name: "Engage, Achieve ve Inspire", nameEn: "Engage, Achieve and Inspire", source: RECF_SOURCES.fee },
  adc: { amount: 200, label: "200 USD", programs: ["adc"], name: "Aerial Drone Competition", nameEn: "Aerial Drone Competition", source: RECF_SOURCES.droneFee },
  adcPro: { amount: ADC_PRO_FEE_CONFIRMED, label: ADC_PRO_FEE_CONFIRMED ? `${ADC_PRO_FEE_CONFIRMED} USD` : FEE_ON_RECFEVENTS, labelEn: ADC_PRO_FEE_CONFIRMED ? `${ADC_PRO_FEE_CONFIRMED} USD` : FEE_ON_RECFEVENTS_EN, programs: ["adc-pro"], name: "ADC Pro", nameEn: "ADC Pro", source: RECF_SOURCES.adcProFee },
} as const;
export type FeeGroup = keyof typeof RECF_FEES;
export const feeGroupFor = (program?: string | null): FeeGroup | null => {
  const p = String(program);
  return (Object.keys(RECF_FEES) as FeeGroup[]).find(group => (RECF_FEES[group].programs as readonly string[]).includes(p)) ?? null;
};
/** Seçilen programın ücret etiketi; program yoksa null. */
export function feeLabel(program?: string | null, lang: "tr" | "en" = "tr") {
  const group = feeGroupFor(program);
  if (!group) return null;
  const fee = RECF_FEES[group];
  return lang === "en" && "labelEn" in fee ? fee.labelEn : fee.label;
}
/** "Engage, Achieve ve Inspire için 175 USD; Aerial Drone Competition için 200 USD; ADC Pro için RECFEvents.org'da gösterilen ücret" */
export const FEE_SUMMARY = `${RECF_FEES.robotics.name} için ${RECF_FEES.robotics.label}; ${RECF_FEES.adc.name} için ${RECF_FEES.adc.label}; ${RECF_FEES.adcPro.name} için ${RECF_FEES.adcPro.label}`;
export const FEE_SUMMARY_EN = `${RECF_FEES.robotics.label} for ${RECF_FEES.robotics.nameEn}; ${RECF_FEES.adc.label} for ${RECF_FEES.adc.nameEn}; ${RECF_FEES.adcPro.labelEn} for ${RECF_FEES.adcPro.nameEn}`;

/**
 * Program uygunluğu ve takım büyüklüğü — RECF KB "Which RECF Competition Do I Choose?" (teyit: 17 Kasım 2026).
 * Inspire için kaynakta takım büyüklüğü belirtilmez.
 */
export const PROGRAM_ELIGIBILITY: Record<string, { tr: string; en: string; teamTr: string | null; teamEn: string | null }> = {
  engage: { tr: "3–8. sınıf (12U ilkokul veya 15U ortaokul) için önerilir", en: "Recommended for grades 3–8 (12U / elementary school or 15U / middle school)", teamTr: "2 veya daha fazla öğrenci", teamEn: "2 or more students" },
  achieve: { tr: "6–12. sınıf (15U ortaokul veya 19U lise) için önerilir", en: "Recommended for grades 6–12 (15U / middle school or 19U / high school)", teamTr: "1 veya daha fazla öğrenci", teamEn: "1 or more students" },
  inspire: { tr: "Yükseköğretime kayıtlı öğrenciler", en: "Matriculated students currently enrolled in post-secondary education", teamTr: null, teamEn: null },
  adc: { tr: "5–12. sınıf (12U ilkokul, 15U ortaokul veya 19U lise) için önerilir", en: "Recommended for grades 5–12 (12U / elementary, 15U / middle or 19U / high school)", teamTr: "2 veya daha fazla öğrenci", teamEn: "2 or more students" },
  "adc-pro": { tr: "9. sınıf ve üstü (19U lise veya yükseköğretim) için önerilir", en: "Recommended for grades 9 and above (19U / high school or post-secondary)", teamTr: "3 veya daha fazla öğrenci", teamEn: "3 or more students" },
};

/**
 * RECF World Championship 2027 — St. Louis.
 * Esas kaynak recf.org/faq (teyit: 17 Kasım 2026): "April 25, 2027 – May 7, 2027". recf.org etkinlik sayfası ve
 * recfevents.org aynı tarihi verir. Not: RECF KB'deki iki makale (41294778999063, 41245796518167) hâlâ
 * 27 Nisan – 6 Mayıs 2027 yazıyor; çelişki rapora işlendi. CMS → Site Ayarları → "World Championship tarih metni"
 * alanı bu değeri tek yerden geçersiz kılabilir.
 */
export const WORLD_CHAMPIONSHIP = {
  name: "RECF STEM World Championship",
  city: "St. Louis, ABD",
  cityEn: "St. Louis, USA",
  label: "25 Nisan – 7 Mayıs 2027",
  labelEn: "April 25 – May 7, 2027",
  source: RECF_SOURCES.faq,
  /** RECF SSS: kontenjanlar güncel takım sayılarına göre Ocak 2027'de dağıtılır. */
  spotsNote: "World Championship kontenjanları geçmiş yılların değil güncel takım sayılarının esas alınmasıyla Ocak 2027'de dağıtılır.",
  spotsNoteEn: "World Championship spots are allocated in January 2027 based on current team counts rather than historical counts.",
} as const;
export type WorldChampionshipInfo = { name: string; city: string; cityEn: string; label: string; labelEn: string; source: string; spotsNote: string; spotsNoteEn: string };
/** CMS ayarı (wc_date_label / wc_date_label_en) varsa onu, yoksa ortak bilgiyi kullanır. */
export function worldChampionship(settings: Record<string, unknown> = {}): WorldChampionshipInfo {
  const tr = String(settings.wc_date_label ?? "").trim(), en = String(settings.wc_date_label_en ?? "").trim();
  return { ...WORLD_CHAMPIONSHIP, label: tr && !hasPlaceholder(tr) ? tr : WORLD_CHAMPIONSHIP.label, labelEn: en && !hasPlaceholder(en) ? en : WORLD_CHAMPIONSHIP.labelEn };
}

/**
 * RECF onayıyla gösterilen resmî temsilcilik unvanı (CMS: recf_representation_approved).
 * Sitede her dilde bu tek ifade kullanılır; çevrilmez.
 */
export const REPRESENTATION_LINE = "Official RECF International Representative";

/**
 * Veri sorumlusu — site, llms.txt, footer ve tüm hukuki metinler bu tek kaynaktan beslenir.
 * Unvan, vergi, MERSİS ve KEP bilgileri mevcut KVKK metninden aynen alınmıştır (değiştirilmedi).
 * Adres, e-posta, telefon, sürüm ve yürürlük tarihi: kullanıcı onayı (denetim 2026-11).
 */
export const DATA_CONTROLLER = {
  title: "INTECHNE TEKNOLOJİ ANONİM ŞİRKETİ",
  shortName: "Intechne Teknoloji A.Ş.",
  taxOffice: "Ümraniye Vergi Dairesi",
  taxNo: "4651617884",
  mersis: "0465161788400001",
  kep: "25838-43551-12850",
  address: "Sanayi Mahallesi, Teknopark Bulvarı No: 1/4C, İç Kapı No: Z08, Pendik / İstanbul",
  email: "destek@recfturkiye.com",
  phone: "0850 308 81 66",
  /** Telefon desteği çalışma saatleri — teyit gelene kadar boş (sitede gösterilmez). */
  phoneHours: "",
} as const;

/** Hukuki metinlerin sürüm ve yürürlük bilgisi (tek kaynak). */
export const LEGAL_VERSION = { version: "1.1", effectiveDate: "2026-11-17", effectiveLabel: "17 Kasım 2026" } as const;

/** Kanonik alan adı. recfturkiye.com → www 308 (Vercel), recfturkiye.org → www.recfturkiye.com 301 (middleware). */
export const CANONICAL_ORIGIN = "https://www.recfturkiye.com";

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

/** Achieve ve Inspire aynı oyunu ("Pinnacle") paylaşır; Inspire ayırt edici alt etiketle gösterilir. */
export function programGameLabel(slug: string | null | undefined, game: string | null | undefined, lang: "tr" | "en" = "tr") {
  const name = String(game || "").trim();
  if (!name) return "";
  return slug === "inspire" && !/·/.test(name) ? `${name} · ${lang === "en" ? "College" : "Üniversite"}` : name;
}
