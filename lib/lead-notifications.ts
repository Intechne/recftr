import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { notificationConfiguration, type NotificationResult } from "@/lib/submission-notifications";
import { LEAD_CONFIG, leadReference, type LeadKindId } from "@/lib/leads";

type Environment = Record<string, string | undefined>;
const validEmail = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;

// Ekip bildirimi kişisel veri içermez; başvuru sahibine giden alındı mesajında yalnız referans bulunur.
export function leadMessages(kind: LeadKindId, id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid lead reference");
  const config = LEAD_CONFIG[kind];
  const reference = leadReference(kind, id);
  const summary = "Talebiniz RECF Türkiye ekibine ulaştı. Ekibimiz en kısa sürede bu e-posta adresi üzerinden sizinle iletişime geçecek.";
  const guide = kind === "destek_randevu" ? "\n\nBu arada resmî kayıt adımlarını Takım Kaydı Rehberi'nden takip edebilirsiniz: https://www.recfturkiye.com/rehber/takim-kaydi" : "";
  return {
    receipt: {
      subject: `RECF Türkiye — ${config.label} alındı (${reference})`,
      text: `${config.label} alındı\n\nReferans: ${reference}\n\n${summary}${guide}\n\nSorularınız için bu e-postayı yanıtlayabilir veya ${PUBLIC_CONTACT.support} adresine yazabilirsiniz.\nhttps://www.recfturkiye.com\n\nRECF Türkiye`,
      html: `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f5f8;color:#10192f;font-family:Arial,Helvetica,sans-serif"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:32px 16px"><table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fff;border:2px solid #10192f;border-collapse:collapse"><tr><td style="background:#10192f;border-bottom:4px solid #29b9e5;color:#29b9e5;padding:24px;font-size:20px;font-weight:bold;letter-spacing:1px">RECF TÜRKİYE</td></tr><tr><td style="padding:28px 24px"><p style="margin:0 0 12px;font-size:12px;letter-spacing:1px;color:#586174">${config.label.toLocaleUpperCase("tr-TR")}</p><h1 style="margin:0 0 20px;font-size:26px;line-height:1.25">Talebiniz alındı</h1><p style="padding:14px 16px;background:#eaf7fc;border-left:4px solid #29b9e5;font-size:16px;font-weight:bold">Referans: ${reference}</p><p style="font-size:15px;line-height:1.7">${summary}</p>${kind === "destek_randevu" ? `<p style="font-size:15px;line-height:1.7">Bu arada resmî kayıt adımlarını <a href="https://www.recfturkiye.com/rehber/takim-kaydi" style="color:#087eaa">Takım Kaydı Rehberi</a>'nden takip edebilirsiniz.</p>` : ""}<p style="margin-top:24px;font-size:14px;line-height:1.7">Sorularınız için bu e-postayı yanıtlayabilir veya <a href="mailto:${PUBLIC_CONTACT.support}" style="color:#087eaa">${PUBLIC_CONTACT.support}</a> adresine yazabilirsiniz.</p></td></tr><tr><td style="padding:18px 24px;background:#10192f;color:#fff;font-size:12px;letter-spacing:1px">MAÇ GÜNÜ. HER GÜN. · <a href="https://www.recfturkiye.com" style="color:#29b9e5">recfturkiye.com</a></td></tr></table></td></tr></table></body></html>`,
      key: `recf-lead-receipt-${kind}-${id}`,
    },
    notice: {
      subject: `RECF Türkiye — Yeni ${config.label.toLocaleLowerCase("tr-TR")}`,
      text: `Yeni ${config.label.toLocaleLowerCase("tr-TR")} kaydedildi.\nReferans: ${reference}\n\nYetkili hesabınızla inceleyin:\nhttps://www.recfturkiye.com/admin/talepler#talep-${id}\n\nBu bildirim talep sahibinin kişisel bilgilerini içermez.`,
      key: `recf-lead-notice-${kind}-${id}`,
    },
  };
}

async function send(id: number, recipient: string, message: { subject: string; text: string; html?: string; key: string }, env: Environment, fetcher: typeof fetch): Promise<NotificationResult> {
  if (!validEmail.test(recipient)) return "failed";
  const from = (env.RECF_NOTIFICATION_FROM || "").trim();
  const body = JSON.stringify({ from: `RECF Türkiye <${from}>`, to: [recipient], reply_to: PUBLIC_CONTACT.support, subject: message.subject, text: message.text, ...(message.html ? { html: message.html } : {}) });
  for (let attempt = 0; attempt < 2; attempt++) {
    let retry = false;
    try {
      const response = await fetcher("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY!.trim()}`, "Content-Type": "application/json", "Idempotency-Key": message.key }, body, signal: AbortSignal.timeout(5000) });
      if (response.ok) { const result = await response.json(); if (typeof result?.id === "string" && result.id) return "accepted"; }
      retry = response.status === 429 || response.status >= 500;
    } catch { retry = true; }
    if (!retry || attempt === 1) break;
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  console.error("[RECF lead email failed]", { id });
  return "failed";
}

/** Ekibe bildirim + talep sahibine alındı mesajı. Preview ortamında hiçbir e-posta gönderilmez. */
export async function notifyLeadRequest(kind: LeadKindId, id: number, recipient: string, env: Environment = process.env, fetcher: typeof fetch = fetch): Promise<NotificationResult> {
  const config = notificationConfiguration(env);
  if (!config.ready) return "disabled";
  try {
    const messages = leadMessages(kind, id);
    const team = (env.RECF_LEADS_NOTIFICATION_TO || env.RECF_NOTIFICATION_TO || "").trim();
    const [receipt] = await Promise.all([send(id, recipient, messages.receipt, env, fetcher), send(id, team, messages.notice, env, fetcher)]);
    return receipt;
  } catch {
    console.error("[RECF lead email failed]", { id });
    return "failed";
  }
}
