// Site genelinde tekrar eden buton ve eylem metinleri — tek yerden değiştirilir.
export const COPY = {
  tr: {
    apply: "TAKIM BAŞVURUSU",
    officialRegistration: "RESMÎ KAYDI TAMAMLA",
    portal: "Takım Portalı (yakında)",
  },
  en: {
    apply: "TEAM APPLICATION",
    officialRegistration: "COMPLETE OFFICIAL REGISTRATION",
    portal: "Team Portal (coming soon)",
  },
} as const;
export type Lang = keyof typeof COPY;
export const copy = (lang: Lang = "tr") => COPY[lang];
