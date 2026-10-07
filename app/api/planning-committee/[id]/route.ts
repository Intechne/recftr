import {NextRequest,NextResponse} from "next/server";
import {approvalsSession} from "@/lib/auth";
import {audit,updateCommitteeApplication} from "@/lib/db";
import {COMMITTEE_STATUSES,type CommitteeStatus} from "@/lib/planning-committee";
import {cleanText} from "@/lib/security";
import {apiError} from "@/lib/api-server";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const session=await approvalsSession(req);
    if(!session)return NextResponse.json({error:"Yetkisiz"},{status:403});
    const id=Number((await params).id),body=await req.json();
    if(!Number.isSafeInteger(id)||id<1||!body||!COMMITTEE_STATUSES.includes(body.status)||!Number.isSafeInteger(body.version)||body.version<1)return NextResponse.json({error:"Geçersiz kayıt veya durum."},{status:400});
    const record=await updateCommitteeApplication(id,body.status as CommitteeStatus,cleanText(body.notes,2000),body.version);
    if(!record)return NextResponse.json({error:"Kayıt başka bir işlemde değişmiş olabilir. Listeyi yenileyin."},{status:409});
    await audit(session.email,"committee_review","planning_committee",String(id),{status:body.status});
    return NextResponse.json(record);
  }catch(error){return apiError(error,"Komite başvurusu güncellenemedi.");}
}
