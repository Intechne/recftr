import {randomUUID} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {contactSession} from "@/lib/auth";
import {createLeadRequest,listLeadRequests,tableExists} from "@/lib/db";
import {LEAD_CONFIG,LEAD_STATUSES,isLeadKind} from "@/lib/leads";
import {provinces} from "@/lib/locations";
import {cleanText,clientIp,enforceRateLimit,rateLimitResponse,securityHash,validEmail} from "@/lib/security";
import {apiError} from "@/lib/api-server";
import {notifyLeadRequest} from "@/lib/lead-notifications";
import {PUBLIC_CONTACT} from "@/lib/public-contact";
export const dynamic="force-dynamic";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const bad=(error:string)=>NextResponse.json({error},{status:400});

export async function POST(req:NextRequest){
  try{
    const limit=await enforceRateLimit(req,"lead-ip",clientIp(req),8,3600);
    if(!limit.ok)return rateLimitResponse(limit.retryAfter);
    const body=await req.json();
    if(!body||typeof body!=="object"||Array.isArray(body))return bad("Geçersiz form.");
    if(cleanText(body.website,100))return NextResponse.json({ok:true},{status:201});
    const kind:unknown=body.kind;
    if(!isLeadKind(kind))return bad("Geçersiz form türü.");
    const config=LEAD_CONFIG[kind];
    const name=cleanText(body.name,120),email=cleanText(body.email,254).toLowerCase(),phone=cleanText(body.phone,40);
    if(!name||!validEmail(email)||/[<>;,\r\n]/.test(email))return bad("Ad soyad ve geçerli bir e-posta adresi zorunludur.");
    const organization=config.organization?cleanText(body.organization,160):"";
    if(config.organization?.required&&!organization)return bad(`${config.organization.label} zorunludur.`);
    const role=config.role?cleanText(body.role,120):"";
    if(config.role&&(role?!config.role.options.includes(role):config.role.required))return bad(`${config.role.label} seçin.`);
    const city=config.city?cleanText(body.city,80):"";
    if(config.city&&!provinces().includes(city))return bad("Geçerli bir il seçin.");
    const message=cleanText(body.message,3000);
    if(config.message.required&&!message)return bad(`${config.message.label} alanı zorunludur.`);
    const details:Record<string,string|string[]>={};
    for(const choice of config.choices){
      const raw=body[choice.field];
      if(choice.multiple){
        if(raw!==undefined&&(!Array.isArray(raw)||raw.length>choice.options.length||!raw.every((x:unknown)=>typeof x==="string"&&choice.options.includes(x))))return bad(`${choice.label} geçersiz.`);
        const picked=[...new Set<string>((raw as string[])||[])];
        if(choice.required&&!picked.length)return bad(`${choice.label} seçin.`);
        details[choice.field]=picked;
      }else{
        const value=cleanText(raw,120);
        if(value?!choice.options.includes(value):choice.required)return bad(`${choice.label} seçin.`);
        details[choice.field]=value;
      }
    }
    if(body.kvkk!==true)return bad("KVKK Aydınlatma Metni için okuma bildirimi zorunludur.");
    const submissionKey=body.submissionKey===undefined?randomUUID():String(body.submissionKey);
    if(!uuid.test(submissionKey))return bad("Form gönderim anahtarı geçersiz. Sayfayı yenileyip tekrar deneyin.");
    if(!(await tableExists("lead_requests")))return NextResponse.json({error:`Bu form çok yakında açılacak. Şimdilik ${PUBLIC_CONTACT.support} adresine yazabilirsiniz.`},{status:503});
    const emailLimit=await enforceRateLimit(req,"lead-email",email,4,86400);
    if(!emailLimit.ok)return rateLimitResponse(emailLimit.retryAfter);
    const data={kind:config.kind,name,email,phone,organization,role,city,message,details};
    const record=await createLeadRequest({...data,submissionKey,fingerprint:securityHash(JSON.stringify(data))});
    if(!record)return NextResponse.json({error:"Bu gönderimin bilgileri değişmiş. Formu yeniden gönderin."},{status:409});
    const confirmationEmail=await notifyLeadRequest(config.kind,record.id,email);
    return NextResponse.json({ok:true,id:record.id,confirmationEmail},{status:201});
  }catch(error){return apiError(error,"Form kaydedilemedi.");}
}

export async function GET(req:NextRequest){
  try{
    if(!(await contactSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:403});
    const kind=cleanText(req.nextUrl.searchParams.get("kind"),40),status=cleanText(req.nextUrl.searchParams.get("status"),40);
    if(kind&&!isLeadKind(kind))return bad("Geçersiz form türü.");
    if(status&&!LEAD_STATUSES.some(x=>x===status))return bad("Geçersiz durum.");
    const rawCursor=req.nextUrl.searchParams.get("cursor");const cursor=rawCursor?Number(rawCursor):undefined;
    if(cursor!==undefined&&(!Number.isSafeInteger(cursor)||cursor<1))return bad("Geçersiz sayfa.");
    if(!(await tableExists("lead_requests")))return NextResponse.json({items:[],nextCursor:null,migrationPending:true});
    return NextResponse.json(await listLeadRequests({kind,status,cursor}));
  }catch(error){return apiError(error,"Talepler alınamadı.");}
}
