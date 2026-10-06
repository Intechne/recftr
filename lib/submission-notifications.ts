import { PUBLIC_CONTACT } from "@/lib/public-contact";

// Server routes only. Administrator notifications contain a reference and panel
// link; applicant receipts contain no private record details. The database remains authoritative.
type Environment = Record<string, string | undefined>;
export type SubmissionKind = "application" | "contact";
export type NotificationResult = "disabled" | "accepted" | "failed";

const email = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
export function notificationConfiguration(env: Environment = process.env) {
  const enabled = env.RECF_NOTIFICATIONS_ENABLED === "1";
  const from = (env.RECF_NOTIFICATION_FROM || "").trim();
  const to = (env.RECF_NOTIFICATION_TO || "").trim();
  const key = (env.RESEND_API_KEY || "").trim();
  const environmentAllowed = !env.VERCEL_ENV || env.VERCEL_ENV === "production";
  return { enabled, ready: enabled && environmentAllowed && email.test(from) && email.test(to) && !!key };
}

export function submissionNotification(kind: SubmissionKind, id: number) {
  if (!["application", "contact"].includes(kind) || !Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid submission reference");
  const application = kind === "application";
  const title = application ? "Yeni takım ön başvurusu" : "Yeni iletişim mesajı";
  const path = application ? `/admin/onaylar#basvuru-${id}` : `/admin/iletisim#mesaj-${id}`;
  return {
    subject: `RECF Türkiye — ${title}`,
    text: `${title} kaydedildi.\nReferans: #${id}\n\nKaydı incelemek için yetkili hesabınızla giriş yapın:\nhttps://www.recfturkiye.com${path}\n\nBu bildirim kişisel iletişim bilgileri içermez.`,
    idempotencyKey: `recf-${kind}-${id}`,
  };
}

export async function notifySubmission(kind: SubmissionKind, id: number, env: Environment = process.env, send: typeof fetch = fetch): Promise<NotificationResult> {
  const config = notificationConfiguration(env);
  if (!config.ready) return "disabled";
  try {
    const notification = submissionNotification(kind, id);
    const response = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY!.trim()}`, "Content-Type": "application/json", "Idempotency-Key": notification.idempotencyKey },
      body: JSON.stringify({ from: env.RECF_NOTIFICATION_FROM!.trim(), to: [env.RECF_NOTIFICATION_TO!.trim()], subject: notification.subject, text: notification.text }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) {
      const body = await response.json();
      if (typeof body?.id === "string" && body.id) return "accepted";
    }
    console.error("[RECF notification failed]", { kind, id, status: response.status });
  } catch {
    // Do not log provider errors, request headers or user-supplied data.
    console.error("[RECF notification failed]", { kind, id });
  }
  return "failed";
}

export function applicationReceipt(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid application reference");
  const reference = `#${String(id).padStart(4,"0")}`;
  const title = "Takım başvurunuz alındı";
  const summary = "RECF Türkiye takım ve mentor ön başvurunuz kaydedildi. Ekibimiz başvurunuzu inceleyerek sonraki adımlar için bu e-posta adresi üzerinden sizinle iletişime geçecek.";
  const note = "Bu bilgilendirme başvurunuzun alındığını belirtir. Resmî sezon kaydı, takım numarası tahsisi veya etkinlik katılım onayı yerine geçmez.";
  return {
    subject: `RECF Türkiye — ${title} (${reference})`,
    text: `${title}\n\nBaşvuru numaranız: ${reference}\n\n${summary}\n\n${note}\n\nSorularınız için bu e-postayı yanıtlayabilir veya ${PUBLIC_CONTACT.support} adresine yazabilirsiniz.\nhttps://www.recfturkiye.com\n\nRECF Türkiye`,
    html: `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f5f8;font-family:Arial,Helvetica,sans-serif;color:#10192f"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:32px 16px"><table role="presentation" style="width:100%;max-width:600px;margin:auto;border-collapse:collapse;background:#fff;border:2px solid #10192f"><tr><td style="padding:24px;background:#10192f;border-bottom:4px solid #29b9e5;color:#29b9e5;font-size:20px;font-weight:bold;letter-spacing:1px">RECF TÜRKİYE</td></tr><tr><td style="padding:28px 24px"><p style="margin:0 0 12px;font-size:12px;letter-spacing:1px;color:#586174">TAKIM VE MENTOR ÖN BAŞVURUSU</p><h1 style="margin:0 0 20px;font-size:26px;line-height:1.25">${title}</h1><p style="padding:14px 16px;background:#eaf7fc;border-left:4px solid #29b9e5;font-size:16px;font-weight:bold">Başvuru numaranız: ${reference}</p><p style="font-size:15px;line-height:1.7">${summary}</p><p style="font-size:13px;line-height:1.7;color:#586174">${note}</p><p style="margin-top:24px;font-size:14px;line-height:1.7">Sorularınız için bu e-postayı yanıtlayabilir veya <a href="mailto:${PUBLIC_CONTACT.support}" style="color:#087eaa">${PUBLIC_CONTACT.support}</a> adresine yazabilirsiniz.</p></td></tr><tr><td style="padding:18px 24px;background:#10192f;color:#fff;font-size:12px;letter-spacing:1px">MAÇ GÜNÜ. HER GÜN. · <a href="https://www.recfturkiye.com" style="color:#29b9e5">recfturkiye.com</a></td></tr></table></td></tr></table></body></html>`,
    idempotencyKey: `recf-application-receipt-${id}`,
  };
}

export async function notifyApplicationReceipt(id: number, recipient: string, env: Environment = process.env, send: typeof fetch = fetch): Promise<NotificationResult> {
  if (!notificationConfiguration(env).ready) return "disabled";
  if (!email.test(recipient)) return "failed";
  try {
    const receipt = applicationReceipt(id);
    const body = JSON.stringify({from:env.RECF_NOTIFICATION_FROM!.trim(),to:[recipient],reply_to:PUBLIC_CONTACT.support,subject:receipt.subject,text:receipt.text,html:receipt.html});
    // The same key/body is reused after a transient failure, so an ambiguous
    // timeout cannot produce another receipt within Resend's idempotency window.
    for (let attempt=0;attempt<2;attempt++) {
      let retry = false;
      try {
        const response = await send("https://api.resend.com/emails", {
          method:"POST",
          headers:{Authorization:`Bearer ${env.RESEND_API_KEY!.trim()}`,"Content-Type":"application/json","Idempotency-Key":receipt.idempotencyKey},
          body,
          signal:AbortSignal.timeout(5000),
        });
        if(response.ok){const result=await response.json();if(typeof result?.id==="string"&&result.id)return "accepted";}
        retry=response.status===429||response.status>=500;
      } catch { retry=true; }
      if(!retry||attempt===1)break;
      await new Promise(resolve=>setTimeout(resolve,1200));
    }
  } catch { /* Never log credentials, email addresses or provider response bodies. */ }
  console.error("[RECF application receipt failed]", {id});
  return "failed";
}
