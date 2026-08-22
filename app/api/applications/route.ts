import {NextRequest,NextResponse} from "next/server";
import {approvalsSession} from "@/lib/auth";
import {createApplication,getSettings,listApplications} from "@/lib/db";
import {isValidProvinceDistrict} from "@/lib/locations";
import {apiError} from "@/lib/api-server";
import {cleanText,clientIp,enforceRateLimit,rateLimitResponse,validEmail} from "@/lib/security";
export const dynamic="force-dynamic";
const PROGRAMS=['engage','achieve','inspire','adc','adc-pro'];
export async function GET(req:NextRequest){try{if(!(await approvalsSession(req)))return NextResponse.json({error:'Yetkisiz'},{status:403});return NextResponse.json(await listApplications());}catch(e){return apiError(e,'Başvurular alınamadı.');}}
export async function POST(req:NextRequest){
  try{
    const ip=clientIp(req);const ipLimit=await enforceRateLimit(req,'application-ip',ip,5,60*60);if(!ipLimit.ok)return rateLimitResponse(ipLimit.retryAfter);
    const b=await req.json();
    // Simple bot honeypot: browsers keep this hidden field empty.
    if(String(b.website||'').trim())return NextResponse.json({ok:true},{status:201});
    const num=cleanText(b.num,10).toUpperCase(),team=cleanText(b.team,120),org=cleanText(b.org,160),city=cleanText(b.city,80),district=cleanText(b.district,80),type=cleanText(b.type,50),program=cleanText(b.program,20),mentor=cleanText(b.mentor,120),email=cleanText(b.email,254).toLowerCase(),phone=cleanText(b.phone,40);
    if(!num||!team||!org||!city||!district||!type||!program||!mentor||!email||!phone)return NextResponse.json({error:'Zorunlu alanlardan biri eksik.'},{status:400});
    if(!isValidProvinceDistrict(city,district))return NextResponse.json({error:'Seçilen il / ilçe eşleşmesi geçersiz.'},{status:400});
    if(!/^[A-Z0-9]{2,10}$/.test(num))return NextResponse.json({error:'Takım numarası geçersiz.'},{status:400});
    if(!validEmail(email))return NextResponse.json({error:'Geçerli e-posta girin.'},{status:400});
    if(!PROGRAMS.includes(program))return NextResponse.json({error:'Geçersiz program.'},{status:400});
    if(b.kvkk!==true)return NextResponse.json({error:'KVKK Aydınlatma Metni onayı zorunludur.'},{status:400});
    const emailLimit=await enforceRateLimit(req,'application-email',email,3,24*60*60);if(!emailLimit.ok)return rateLimitResponse(emailLimit.retryAfter);
    const s=await getSettings([`registration_fee_${program}`,'field_kit_fee','registration_discount']);const base=Number(s[`registration_fee_${program}`]);if(!Number.isFinite(base))return NextResponse.json({error:'Geçersiz program veya kayıt ücreti tanımsız.'},{status:400});
    const total=Math.max(0,base+(b.kit?Number(s.field_kit_fee)||0:0)-(Number(s.registration_discount)||0));
    const out=await createApplication({num,team,org,city,district,type,program,mentor,email,phone,kit:!!b.kit,kvkkAccepted:true,total});
    return NextResponse.json({ok:true,...out,note:'Takım numarası başvuru onaylanana kadar kesin olarak rezerve edilmez.'},{status:201});
  }catch(e:any){const msg=String(e?.message||'');if(msg.includes('TEAM_NUM_USED')||msg.includes('unique')||msg.includes('duplicate'))return NextResponse.json({error:'Bu takım numarası onaylı bir takım tarafından kullanılıyor.'},{status:409});return apiError(e,'Başvuru kaydedilemedi.');}
}
