import {NextRequest,NextResponse} from "next/server";
import {contactSession} from "@/lib/auth";
import {audit,updateLeadRequest} from "@/lib/db";
import {LEAD_STATUSES} from "@/lib/leads";
import {cleanText} from "@/lib/security";
import {apiError} from "@/lib/api-server";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const session=await contactSession(req);
    if(!session)return NextResponse.json({error:"Yetkisiz"},{status:403});
    const id=Number((await params).id),body=await req.json();
    if(!Number.isSafeInteger(id)||id<1||!body||!LEAD_STATUSES.includes(body.status)||!Number.isSafeInteger(body.version)||body.version<1)return NextResponse.json({error:"Geçersiz kayıt veya durum."},{status:400});
    const record=await updateLeadRequest(id,body.status,cleanText(body.notes,2000),body.version);
    if(!record)return NextResponse.json({error:"Kayıt başka bir işlemde değişmiş olabilir. Listeyi yenileyin."},{status:409});
    await audit(session.email,"lead_review","lead_request",String(id),{status:body.status});
    return NextResponse.json(record);
  }catch(error){return apiError(error,"Talep güncellenemedi.");}
}
