import documents from "@/lib/provided-legal-documents.json";
import { DATA_CONTROLLER, LEGAL_VERSION } from "@/lib/site-config";

/**
 * Hukuki metinler sağlanan PDF'lerin metninden gelir. Yalnız olgusal alanlar (veri sorumlusu adresi, e-posta,
 * telefon, tarih, sürüm) tek kaynaktan — lib/site-config.ts DATA_CONTROLLER / LEGAL_VERSION — doldurulur.
 * Hukuki hükümler değiştirilmez.
 */
const CONTROLLER_LINES: Array<[RegExp, string]> = [
  [/^Adresi\s*:.*$/m, `Adresi : ${DATA_CONTROLLER.address}`],
  [/^Telefon\s*:.*$/m, `Telefon : ${DATA_CONTROLLER.phone}`],
  [/^Elektronik Posta Adresi\s*:.*$/m, `Elektronik Posta Adresi : ${DATA_CONTROLLER.email}`],
  [/^Aydınlatma Metni Tarihi\s*:.*$/m, `Aydınlatma Metni Tarihi : ${LEGAL_VERSION.effectiveLabel}`],
];

export function applyControllerFacts(text: string) {
  let out = text.replace(/off-season@intechne\.com\.tr/g, DATA_CONTROLLER.email);
  for (const [pattern, line] of CONTROLLER_LINES) out = out.replace(pattern, line);
  return out;
}

/** Yalnız indirilebilir PDF formda doldurulan alanlar (veli/öğrenci adı, imza, etkinlik bilgisi vb.). */
const FORM_FIELD = /^(?:Veli Ad Soyad|Açık Rıza Tarihi|Tarih|Etkinlik \/ Yarışma Adı|Etkinlik Tarihi|Etkinlik Yeri|Adı Soyadı \/ TC\. Kimlik No|Okulu \/ Kurumu \/ Takımı|Veli Adı Soyadı \/ TC\. Kimlik No|İletişim)\s*:.*$|^İmza\s+İmza$/;

/** Web görünümü: "…" ile biten form alanları sayfada gösterilmez; PDF'te kalır. */
export function webText(text: string) {
  return text.split("\n").filter(line => !FORM_FIELD.test(line.trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type LegalDoc = (typeof documents)[number] & { version: string; effectiveDate: string; effectiveLabel: string };

export const LEGAL_DOCUMENTS: LegalDoc[] = documents.map(document => ({
  ...document,
  pages: document.pages.map(applyControllerFacts),
  version: LEGAL_VERSION.version,
  effectiveDate: LEGAL_VERSION.effectiveDate,
  effectiveLabel: LEGAL_VERSION.effectiveLabel,
}));

export function legalDocument(slug: string) { return LEGAL_DOCUMENTS.find(document => document.slug === slug); }
