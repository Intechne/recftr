import {randomUUID} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {approvalsSession} from "@/lib/auth";
import {createCommitteeApplication,listCommitteeApplications} from "@/lib/db";
import {COMMITTEE_AREAS,COMMITTEE_AVAILABILITIES,COMMITTEE_STATUSES,type CommitteeApplicationInput,type CommitteeStatus} from "@/lib/planning-committee";
import {isValidProvinceDistrict} from "@/lib/locations";
import {cleanText,clientIp,enforceRateLimit,rateLimitResponse,securityHash,validEmail} from "@/lib/security";
import {apiError} from "@/lib/api-server";
import {notifyCommitteeApplication} from "@/lib/committee-notifications";
export const dynamic="force-dynamic";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req:NextRequest){
  try{
    const limit=await enforceRateLimit(req,"committee-ip",clientIp(req),5,3600);
    if(!limit.ok)return rateLimitResponse(limit.retryAfter);
    const body=await req.json();
    if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"Geçersiz başvuru."},{status:400});
    if(cleanText(body.website,100))return NextResponse.json({ok:true},{status:201});
    const name=cleanText(body.name,120),email=cleanText(body.email,254).toLowerCase();
    const city=cleanText(body.city,80),district=cleanText(body.district,80),motivation=cleanText(body.motivation,2000);
    if(!Array.isArray(body.areas)||body.areas.length>3||!body.areas.every((area:unknown)=>typeof area==="string"))return NextResponse.json({error:"Bir ile üç arasında katkı alanı seçin."},{status:400});
    const areas=[...new Set<string>(body.areas as string[])].sort();
    const availability=cleanText(body.availability,100);
    if(!name||!validEmail(email)||/[<>;,\r\n]/.test(email)||!motivation)return NextResponse.json({error:"Ad soyad, geçerli e-posta ve motivasyon açıklaması zorunludur."},{status:400});
    if(!isValidProvinceDistrict(city,district))return NextResponse.json({error:"Geçerli bir il ve ilçe seçin."},{status:400});
    if(areas.length<1||areas.length>3||areas.some(area=>!COMMITTEE_AREAS.some(option=>option.id===area)))return NextResponse.json({error:"Bir ile üç arasında katkı alanı seçin."},{status:400});
    if(!COMMITTEE_AVAILABILITIES.some(option=>option===availability))return NextResponse.json({error:"Katılım uygunluğunuzu seçin."},{status:400});
    if(body.adult!==true)return NextResponse.json({error:"Bu başvuru yetişkin gönüllülere açıktır."},{status:400});
    if(body.kvkk!==true)return NextResponse.json({error:"KVKK Aydınlatma Metni için okuma bildirimi gerekir."},{status:400});
    const submissionKey=body.submissionKey===undefined?randomUUID():String(body.submissionKey);
    if(!uuid.test(submissionKey))return NextResponse.json({error:"Başvuru gönderim anahtarı geçersiz. Sayfayı yenileyip tekrar deneyin."},{status:400});
    const emailLimit=await enforceRateLimit(req,"committee-email",email,3,86400);
    if(!emailLimit.ok)return rateLimitResponse(emailLimit.retryAfter);
    const data={name,email,phone:cleanText(body.phone,40),city,district,organization:cleanText(body.organization,160),occupation:cleanText(body.occupation,120),areas,availability,experience:cleanText(body.experience,2000),motivation};
    const input:CommitteeApplicationInput={...data,submissionKey,fingerprint:securityHash(JSON.stringify(data))};
    const record=await createCommitteeApplication(input);
    if(!record)return NextResponse.json({error:"Bu gönderimin bilgileri değişmiş. Formu yeniden gönderin."},{status:409});
    const confirmationEmail=await notifyCommitteeApplication(record.id,email);
    return NextResponse.json({ok:true,id:record.id,confirmationEmail},{status:201});
  }catch(error){return apiError(error,"Komite başvurusu kaydedilemedi.");}
}

export async function GET(req:NextRequest){
  try{
    if(!(await approvalsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:403});
    const status=cleanText(req.nextUrl.searchParams.get("status"),40);
    if(status&&!COMMITTEE_STATUSES.some(option=>option===status))return NextResponse.json({error:"Geçersiz durum."},{status:400});
    const rawCursor=req.nextUrl.searchParams.get("cursor");const cursor=rawCursor?Number(rawCursor):undefined;
    if(cursor!==undefined&&(!Number.isSafeInteger(cursor)||cursor<1))return NextResponse.json({error:"Geçersiz sayfa."},{status:400});
    return NextResponse.json(await listCommitteeApplications({cursor,status:status as CommitteeStatus|"",search:cleanText(req.nextUrl.searchParams.get("q"),100)}));
  }catch(error){return apiError(error,"Komite başvuruları alınamadı.");}
}
