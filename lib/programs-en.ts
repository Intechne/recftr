import { RECF_FEES } from "@/lib/site-config";

// İngilizce program özetleri — kaynak: games.recf.org program sayfaları ve RECF KB (teyit: 16 Kasım 2026).
// Sürüm numarası yazılmaz; manual linki her zaman güncel yayınlanmış sürüme gider.
export const PROGRAMS_EN = [
  { slug: "engage", code: "ENG", name: "RECF Engage", game: "Tier Takeover", ages: "Elementary school (U12) and middle school (U15)", summary: "An introduction to competitive robotics. Teams compete in solo driving, solo coding and alliance matches.", manual: "https://games.recf.org/engage", fee: RECF_FEES.robotics },
  { slug: "achieve", code: "ACH", name: "RECF Achieve", game: "Pinnacle", ages: "Middle school (U15) and high school (U19)", summary: "Robots collect and stack pins and cups onto goals across solo driving, solo coding and alliance match formats.", manual: "https://games.recf.org/achieve", fee: RECF_FEES.robotics },
  { slug: "inspire", code: "INS", name: "RECF Inspire", game: "Pinnacle", ages: "Post-secondary / college students", summary: "The collegiate program: each team brings two robots to every match and designs them to work together.", manual: "https://games.recf.org/inspire", fee: RECF_FEES.robotics },
  { slug: "adc", code: "ADC", name: "Aerial Drone Competition", game: "Mission 2027: Fast Track", ages: "12U (elementary), 15U (middle school) and 19U (high school)", summary: "Students pilot and program drones in teamwork, solo autonomous flight, solo piloting and communications missions.", manual: "https://games.recf.org/adc", fee: RECF_FEES.drones },
  { slug: "adc-pro", code: "PRO", name: "Aerial Drone Competition Pro", game: "Mission 2026-2027: Off Grid", ages: "High school teams (students up to 19) and collegiate students", summary: "Teams pilot and program drones and ground robots across teamwork, solo autonomous, solo piloting and communications missions.", manual: "https://games.recf.org/pro", fee: RECF_FEES.drones },
] as const;
