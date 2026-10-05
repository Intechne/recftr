// Server routes only. Notifications contain a reference and authenticated panel link,
// never the applicant's contact details or message. Database records remain authoritative.
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
