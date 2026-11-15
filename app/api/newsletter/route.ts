import {NextRequest,NextResponse} from "next/server";
import {contactSession} from "@/lib/auth";
import {audit,listNewsletterSubscriptions,setNewsletterStatus,subscribeNewsletter,tableExists} from "@/lib/db";
import {newsletterConsentText} from "@/lib/newsletter";
import {cleanText,clientIp,enforceRateLimit,rateLimitResponse,validEmail} from "@/lib/security";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";

export async function POST(req:NextRequest){
  try{
    const limit=await enforceRateLimit(req,"newsletter-ip",clientIp(req),6,3600);
    if(!limit.ok)return rateLimitResponse(limit.retryAfter);
    const body=await req.json();
    if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"Geçersiz istek."},{status:400});
    if(cleanText(body.website,100))return NextResponse.json({ok:true},{status:201});
    const email=cleanText(body.email,254).toLowerCase();
    if(!validEmail(email)||/[<>;,\r\n]/.test(email))return NextResponse.json({error:"Geçerli bir e-posta adresi girin."},{status:400});
    if(body.consent!==true)return NextResponse.json({error:"Bülten için açık rıza onay kutusunu işaretleyin."},{status:400});
    const source=["footer","footer-en"].includes(body.source)?body.source:"footer";
    if(!(await tableExists("newsletter_subscriptions")))return NextResponse.json({error:"Bülten kaydı çok yakında açılacak."},{status:503});
    const emailLimit=await enforceRateLimit(req,"newsletter-email",email,3,86400);
    if(!emailLimit.ok)return rateLimitResponse(emailLimit.retryAfter);
    await subscribeNewsletter(email,newsletterConsentText(source),source);
    return NextResponse.json({ok:true},{status:201});
  }catch(error){return apiError(error,"Bülten kaydı yapılamadı.");}
}

export async function GET(req:NextRequest){
  try{
    if(!(await contactSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:403});
    if(!(await tableExists("newsletter_subscriptions")))return NextResponse.json({items:[],migrationPending:true});
    return NextResponse.json({items:await listNewsletterSubscriptions()});
  }catch(error){return apiError(error,"Bülten listesi alınamadı.");}
}

export async function PATCH(req:NextRequest){
  try{
    const session=await contactSession(req);
    if(!session)return NextResponse.json({error:"Yetkisiz"},{status:403});
    const body=await req.json();const id=Number(body?.id);
    if(!Number.isSafeInteger(id)||id<1||!["AKTİF","AYRILDI"].includes(body?.status))return NextResponse.json({error:"Geçersiz kayıt veya durum."},{status:400});
    const record=await setNewsletterStatus(id,body.status);
    if(!record)return NextResponse.json({error:"Kayıt bulunamadı."},{status:404});
    await audit(session.email,"newsletter_status","newsletter",String(id),{status:body.status});
    return NextResponse.json(record);
  }catch(error){return apiError(error,"Bülten kaydı güncellenemedi.");}
}
