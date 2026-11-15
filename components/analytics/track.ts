"use client";
import { track } from "@vercel/analytics";

/**
 * Kayıt hunisi olayları. Kişisel veri GÖNDERİLMEZ: yalnız sabit olay adları ve
 * form türü / program kodu / sayfa yolu gibi anonim özellikler.
 */
export type FunnelEvent = "form_start" | "form_submit" | "guide_view" | "recfevents_click" | "lead_submit" | "newsletter_submit";
type Props = Record<string, string | number | boolean | null>;

export function trackEvent(name: FunnelEvent, props?: Props) {
  try { track(name, props); } catch { /* Analitik hiçbir zaman kullanıcı akışını bozmaz. */ }
}
