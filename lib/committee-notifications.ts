import {PUBLIC_CONTACT} from "@/lib/public-contact";
import {notificationConfiguration,type NotificationResult} from "@/lib/submission-notifications";
type Environment=Record<string,string|undefined>;
const validEmail=/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
export function committeeNotificationMessages(id:number){
  if(!Number.isSafeInteger(id)||id<1)throw new Error("Invalid committee reference");
  const reference=`PK-${String(id).padStart(4,"0")}`;
  const summary="RECF Türkiye Planlama Komitesi gönüllü başvurunuz kaydedildi. Ekibimiz katkı alanlarınızı ve uygunluğunuzu inceleyerek sonraki adımlar için bu e-posta adresi üzerinden sizinle iletişime geçecek.";
  const note="Bu mesaj başvurunuzun alındığını bildirir. Komite üyeliği veya görev ataması, değerlendirme ve karşılıklı görüşme sonrasında ayrıca netleştirilir.";
  const subject=`RECF Türkiye — Planlama komitesi başvurunuz alındı (${reference})`;
  return {
    receipt:{subject,text:`Planlama komitesi başvurunuz alındı\n\nReferans: ${reference}\n\n${summary}\n\n${note}\n\nSorularınız için bu e-postayı yanıtlayabilirsiniz: ${PUBLIC_CONTACT.events}\nhttps://www.recfturkiye.com/planlama-komitesi`,html:`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f5f8;color:#10192f;font-family:Arial,Helvetica,sans-serif"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:32px 16px"><table role="presentation" style="width:100%;max-width:600px;margin:auto;background:white;border:2px solid #10192f;border-collapse:collapse"><tr><td style="background:#10192f;border-bottom:4px solid #29b9e5;color:#29b9e5;padding:24px;font-size:20px;font-weight:bold">RECF TÜRKİYE</td></tr><tr><td style="padding:28px 24px"><p style="font-size:12px;letter-spacing:1px;color:#586174">PLANLAMA KOMİTESİ · GÖNÜLLÜ BAŞVURUSU</p><h1 style="font-size:26px;line-height:1.25">Başvurunuz alındı</h1><p style="background:#eaf7fc;border-left:4px solid #29b9e5;padding:14px;font-weight:bold">Başvuru numaranız: ${reference}</p><p style="font-size:15px;line-height:1.7">${summary}</p><p style="font-size:13px;line-height:1.7;color:#586174">${note}</p><p style="font-size:14px;line-height:1.7">Sorularınız için bu e-postayı yanıtlayabilir veya <a style="color:#087eaa" href="mailto:${PUBLIC_CONTACT.events}">${PUBLIC_CONTACT.events}</a> adresine yazabilirsiniz.</p></td></tr><tr><td style="background:#10192f;color:#fff;padding:18px 24px;font-size:12px">MAÇ GÜNÜ. HER GÜN. · <a style="color:#29b9e5" href="https://www.recfturkiye.com/planlama-komitesi">Planlama Komitesi</a></td></tr></table></td></tr></table></body></html>`,key:`recf-committee-receipt-${id}`},
    notice:{subject:"RECF Türkiye — Yeni planlama komitesi başvurusu",text:`Yeni gönüllü başvurusu kaydedildi.\nReferans: ${reference}\n\nYetkili hesabınızla inceleyin:\nhttps://www.recfturkiye.com/admin/planlama-komitesi#basvuru-${id}\n\nBu bildirim başvuru sahibinin kişisel bilgilerini içermez.`,key:`recf-committee-notice-${id}`},
  };
}
async function sendMessage(id:number,kind:string,recipient:string,message:{subject:string;text:string;html?:string;key:string},env:Environment,send:typeof fetch):Promise<NotificationResult>{
  if(!validEmail.test(recipient))return "failed";
  const from=(env.RECF_NOTIFICATION_FROM||"").trim();
  const body=JSON.stringify({from:`RECF Türkiye · Planlama Komitesi <${from}>`,to:[recipient],reply_to:PUBLIC_CONTACT.events,subject:message.subject,text:message.text,...(message.html?{html:message.html}:{})});
  for(let attempt=0;attempt<2;attempt++){
    let retry=false;
    try{
      const response=await send("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY!.trim()}`,"Content-Type":"application/json","Idempotency-Key":message.key},body,signal:AbortSignal.timeout(5000)});
      if(response.ok){const result=await response.json();if(typeof result?.id==="string"&&result.id)return "accepted";}
      retry=response.status===429||response.status>=500;
    }catch{retry=true;}
    if(!retry||attempt===1)break;
    await new Promise(resolve=>setTimeout(resolve,1200));
  }
  console.error("[RECF committee email failed]",{id,kind});
  return "failed";
}
export async function notifyCommitteeApplication(id:number,recipient:string,env:Environment=process.env,send:typeof fetch=fetch):Promise<NotificationResult>{
  if(!notificationConfiguration(env).ready)return "disabled";
  try{
    const messages=committeeNotificationMessages(id);
    const to=(env.RECF_COMMITTEE_NOTIFICATION_TO||PUBLIC_CONTACT.events).trim();
    const [receipt]=await Promise.all([sendMessage(id,"receipt",recipient,messages.receipt,env,send),sendMessage(id,"notice",to,messages.notice,env,send)]);
    return receipt;
  }catch{console.error("[RECF committee email failed]",{id});return "failed";}
}
