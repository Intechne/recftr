import {PUBLIC_CONTACT} from "@/lib/public-contact";
import {notificationConfiguration} from "@/lib/submission-notifications";
import {claimApplicationApprovalEmail,finishApplicationApprovalEmail} from "@/lib/db";

type Environment=Record<string,string|undefined>;
type ApprovedApplication={id:number;num:string;team:string;program:string;email:string};
export type ApprovalEmailResult='accepted'|'failed'|'disabled'|'sending'|'unavailable';
const programs:Record<string,string>={engage:'Engage',achieve:'Achieve',inspire:'Inspire',adc:'Aerial Drone Competition','adc-pro':'ADC Pro'};
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
export function applicationApprovalMessage(app:ApprovedApplication){
  if(!Number.isSafeInteger(app.id)||app.id<1)throw new Error('Invalid application reference');
  const reference=`#${String(app.id).padStart(4,'0')}`;
  const summary='Takım başvurunuz RECF Türkiye ekibi tarafından onaylandı ve yerel takım kaydınız oluşturuldu. Sıradaki hazırlık adımlarını aşağıda bulabilirsiniz.';
  const steps=[
    {title:'Takım bilgilerinizi kontrol edin',text:'Aşağıdaki takım referansını ve programınızı kontrol edin. Bir düzeltme gerekiyorsa bu e-postayı yanıtlayarak ekibimize bildirin.',url:'https://www.recfturkiye.com/rehber/takim-kaydi',link:'Takım kayıt rehberi'},
    {title:'Resmî sezon kayıt adımlarını tamamlayın',text:'Resmî sezon kaydı ve takım numarası tahsisi için programınıza ait RECFevents sürecini ayrıca tamamlayın. Hangi adımları izleyeceğiniz konusunda destek ekibimizle iletişime geçebilirsiniz.',url:'https://www.recfturkiye.com/rehber/takim-kaydi',link:'Kayıt adımlarını inceleyin'},
    {title:'Sezon dokümanlarıyla hazırlığa başlayın',text:'Programınıza ait güncel oyun kılavuzlarını inceleyin; takımınızı ve donanımınızı bu kurallara göre hazırlayın.',url:'https://www.recfturkiye.com/dokumanlar',link:'Sezon dokümanları'},
    {title:'Etkinlikleri ve portal duyurularını takip edin',text:'Etkinlik tarihlerini ve katılım koşullarını takip edin. Takım portalı henüz açılmadı; giriş ve kullanım bilgileri portal yayına alındığında ayrıca paylaşılacak.',url:'https://www.recfturkiye.com/etkinlikler',link:'Etkinlik takvimi'},
  ];
  const note='Bu onay RECF Türkiye yerel takım başvurunuz içindir. Resmî sezon kaydı, resmî takım numarası tahsisi veya etkinlik katılım onayı yerine geçmez. Etkinlik kayıtları ve kontenjanları ayrıca değerlendirilir.';
  const program=programs[app.program]||app.program;
  const text=`Takımınız onaylandı\n\n${summary}\n\nBaşvuru: ${reference}\nTakım: ${app.team}\nYerel takım referansı: ${app.num}\nProgram: ${program}\n\nSIRADAKİ ADIMLAR\n\n${steps.map((step,index)=>`${index+1}. ${step.title}\n${step.text}\n${step.url}`).join('\n\n')}\n\n${note}\n\nTakım ve kayıt soruları: ${PUBLIC_CONTACT.support}\nEtkinlik soruları: ${PUBLIC_CONTACT.events}\nBu e-postayı yanıtlayarak bize ulaşabilirsiniz.\n\nRECF Türkiye — Maç Günü. Her Gün.`;
  const html=`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f5f8;color:#10192f;font-family:Arial,Helvetica,sans-serif"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:32px 16px"><table role="presentation" style="width:100%;max-width:600px;margin:auto;border:2px solid #10192f;border-collapse:collapse;background:white"><tr><td style="padding:24px;background:#10192f;border-bottom:4px solid #29b9e5;color:#29b9e5;font-size:20px;font-weight:bold;letter-spacing:1px">RECF TÜRKİYE</td></tr><tr><td style="padding:28px 24px"><p style="font-size:12px;letter-spacing:1px;color:#586174">TAKIM BAŞVURU ONAYI</p><h1 style="font-size:28px;line-height:1.25;margin:12px 0 20px">Takımınız onaylandı</h1><p style="font-size:15px;line-height:1.7">${summary}</p><div style="padding:16px;background:#eaf7fc;border-left:4px solid #29b9e5;font-size:14px;line-height:1.8"><strong>${escapeHtml(app.team)}</strong><br>Başvuru: ${reference}<br>Yerel takım referansı: ${escapeHtml(app.num)}<br>Program: ${escapeHtml(program)}</div><h2 style="font-size:18px;margin:28px 0 16px">Sıradaki adımlar</h2>${steps.map((step,index)=>`<div style="border-top:1px solid #dde1e8;padding:16px 0"><h3 style="font-size:15px;margin:0 0 8px">${index+1}. ${step.title}</h3><p style="font-size:14px;line-height:1.7;margin:0 0 8px">${step.text}</p><a href="${step.url}" style="font-size:14px;font-weight:bold;color:#087eaa">${step.link} →</a></div>`).join('')}<p style="font-size:13px;line-height:1.7;color:#586174">${note}</p><p style="font-size:14px;line-height:1.7">Takım ve kayıt soruları: <a style="color:#087eaa" href="mailto:${PUBLIC_CONTACT.support}">${PUBLIC_CONTACT.support}</a><br>Etkinlik soruları: <a style="color:#087eaa" href="mailto:${PUBLIC_CONTACT.events}">${PUBLIC_CONTACT.events}</a><br>Bu e-postayı yanıtlayarak bize ulaşabilirsiniz.</p></td></tr><tr><td style="padding:18px 24px;background:#10192f;color:white;font-size:12px">MAÇ GÜNÜ. HER GÜN. · <a href="https://www.recfturkiye.com" style="color:#29b9e5">recfturkiye.com</a></td></tr></table></td></tr></table></body></html>`;
  return {subject:`RECF Türkiye — Takımınız onaylandı (${reference})`,text,html,key:`recf-application-approved-${app.id}`};
}

export async function sendApplicationApproval(app:ApprovedApplication,env:Environment=process.env,send:typeof fetch=fetch):Promise<{status:'accepted'|'failed'|'disabled';providerId?:string}>{
  const config=notificationConfiguration(env);
  if(!config.ready)return {status:'disabled'};
  if(!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(app.email))return {status:'failed'};
  const message=applicationApprovalMessage(app);
  // Credentials are deliberately excluded; the portal is still awaiting launch.
  const body=JSON.stringify({from:config.sender,to:[app.email],reply_to:PUBLIC_CONTACT.support,subject:message.subject,text:message.text,html:message.html});
  for(let attempt=0;attempt<2;attempt++){
    let retry=false;
    try{
      const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY!.trim()}`,'Content-Type':'application/json','Idempotency-Key':message.key},body,signal:AbortSignal.timeout(5000)});
      if(response.ok){const result=await response.json();if(typeof result?.id==='string'&&result.id)return {status:'accepted',providerId:result.id};}
      retry=response.status===429||response.status>=500;
    }catch{retry=true;}
    if(!retry||attempt===1)break;
    await new Promise(resolve=>setTimeout(resolve,1200));
  }
  return {status:'failed'};
}

export async function notifyApprovedApplication(id:number):Promise<ApprovalEmailResult>{
  try{
    const record=await claimApplicationApprovalEmail(id);
    if(!record.app||!record.claim)return record.status as ApprovalEmailResult;
    const result=await sendApplicationApproval(record.app);
    const saved=await finishApplicationApprovalEmail(id,record.claim,result.status,result.providerId);
    if(!saved)return 'sending';
    return result.status;
  }catch{
    // A failed notification must never undo an approved team or expose credentials.
    console.error('[RECF approval email failed]',{id});
    return 'failed';
  }
}
