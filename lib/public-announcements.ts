export const FALLBACK_TICKER = [
  "RECF Türkiye robotik ve drone programlarını keşfedin",
  "Takım ön başvurusu için kayıt formunu inceleyin",
  "Güncel etkinlik ve eğitim bilgileri için duyuruları takip edin",
];

/**
 * Duyuru şeridi CMS'ten (Site Ayarları → Duyuru şeridi) yönetilir.
 * {{founding_count}} belirteci güncel Founding 100 sayısıyla değiştirilir; sayı alınamazsa o mesaj gösterilmez.
 */
export function publicTickerMessages(raw?: string, now = Date.now(), foundingCount: number | null = null): string[] {
  let messages: string[] = [];
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (Array.isArray(parsed) && parsed.every(value => typeof value === "string")) {
      messages = parsed.map(value => value.trim()).filter(Boolean);
    }
  } catch { /* Invalid CMS content falls back to timeless navigation messages. */ }
  // Only withdraw the known expired September 2026 campaign. Preserve new CMS copy.
  if (now >= Date.parse("2026-09-30T21:00:00Z")) {
    messages = messages.filter(message => !/^Coach Academy Eylül dönemi başvuruları başlıyor!?$/i.test(message));
  }
  messages = messages.flatMap(message => {
    if (!/\{\{\s*founding_count\s*\}\}/.test(message)) return [message];
    return foundingCount && foundingCount > 0 ? [message.replace(/\{\{\s*founding_count\s*\}\}/g, String(foundingCount))] : [];
  });
  return messages.length ? messages : [...FALLBACK_TICKER];
}
