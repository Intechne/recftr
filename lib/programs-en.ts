import { PROGRAM_ELIGIBILITY, feeLabel } from "@/lib/site-config";

// İngilizce program özetleri — kaynak: games.recf.org program sayfaları ve RECF KB (teyit: 17 Kasım 2026).
// Uygunluk ve takım büyüklüğü: PROGRAM_ELIGIBILITY (RECF KB "Which RECF Competition Do I Choose?").
// Sürüm numarası yazılmaz; manual linki her zaman güncel yayınlanmış sürüme gider.
export const PROGRAMS_EN = [
  { slug: "engage", code: "ENG", name: "RECF Engage", game: "Tier Takeover", ages: PROGRAM_ELIGIBILITY["engage"].en, team: PROGRAM_ELIGIBILITY["engage"].teamEn, summary: "An introduction to competitive robotics. Teams compete in solo driving, solo coding and alliance matches.", manual: "https://games.recf.org/engage", fee: feeLabel("engage", "en") },
  { slug: "achieve", code: "ACH", name: "RECF Achieve", game: "Pinnacle", ages: PROGRAM_ELIGIBILITY["achieve"].en, team: PROGRAM_ELIGIBILITY["achieve"].teamEn, summary: "Robots collect and stack pins and cups onto goals across solo driving, solo coding and alliance match formats.", manual: "https://games.recf.org/achieve", fee: feeLabel("achieve", "en") },
  { slug: "inspire", code: "INS", name: "RECF Inspire", game: "Pinnacle · College", ages: PROGRAM_ELIGIBILITY["inspire"].en, team: PROGRAM_ELIGIBILITY["inspire"].teamEn, summary: "The collegiate program: each team brings two robots to every match and designs them to work together.", manual: "https://games.recf.org/inspire", fee: feeLabel("inspire", "en") },
  { slug: "adc", code: "ADC", name: "Aerial Drone Competition", game: "Mission 2027: Fast Track", ages: PROGRAM_ELIGIBILITY["adc"].en, team: PROGRAM_ELIGIBILITY["adc"].teamEn, summary: "Students pilot and program drones in teamwork, solo autonomous flight, solo piloting and communications missions.", manual: "https://games.recf.org/adc", fee: feeLabel("adc", "en") },
  { slug: "adc-pro", code: "PRO", name: "Aerial Drone Competition Pro", game: "Mission 2026-2027: Off Grid", ages: PROGRAM_ELIGIBILITY["adc-pro"].en, team: PROGRAM_ELIGIBILITY["adc-pro"].teamEn, summary: "Teams pilot and program drones and ground robots across teamwork, solo autonomous, solo piloting and communications missions.", manual: "https://games.recf.org/pro", fee: feeLabel("adc-pro", "en") },
] as const;
