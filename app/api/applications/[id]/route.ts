import { NextRequest, NextResponse } from "next/server";
import { approvalsSession } from "@/lib/auth";
import { audit, resolveApplication } from "@/lib/db";
import { apiError } from "@/lib/api-server";
import { publishContentChange } from "@/lib/content-consistency";
import {notifyApprovedApplication} from "@/lib/application-approval-notifications";
export const dynamic="force-dynamic";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const s=await approvalsSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:403});
    const {id}=await params;const applicationId=Number(id);const {action}=await req.json();if(!Number.isSafeInteger(applicationId)||applicationId<1||!["approve","reject","approval-email"].includes(action))return NextResponse.json({error:"Geçersiz işlem"},{status:400});
    if(action==='approval-email'){
      const approvalEmail=await notifyApprovedApplication(applicationId);
      if(approvalEmail==='unavailable')return NextResponse.json({error:'Bu başvuruya ait aktif, onaylı takım bulunamadı.'},{status:409});
      await audit(s.email,'approval-email','application',id,{status:approvalEmail});
      return NextResponse.json({ok:true,approvalEmail},{headers:{'Cache-Control':'no-store'}});
    }
    const out=await resolveApplication(Number(id),action);if(!out)return NextResponse.json({error:"Başvuru yok"},{status:404});
    const approvalEmail=action==='approve'?await notifyApprovedApplication(applicationId):undefined;
    if(!out.alreadyResolved){await audit(s.email,action,"application",id,{num:out.app.num});if(action==='approve')await publishContentChange(['/','/takimlar']);}
    return NextResponse.json({ok:true,num:out.app.num,action,temporaryPassword:out.temporaryPassword,approvalEmail},{headers:{'Cache-Control':'no-store'}});
  }catch(e:any){const code=String(e?.message||'');if(code.includes('APPLICATION_ALREADY_RESOLVED'))return NextResponse.json({error:'Bu başvuru daha önce sonuçlandırılmış. Onaylı takımın durumunu Takımlar bölümünden yönetin.'},{status:409});if(code.includes('TEAM_NUM_USED'))return NextResponse.json({error:'Bu takım numarası başka bir onaylı takım tarafından kullanılıyor. Başvuru onaylanmadı.'},{status:409});if(code.includes('EMAIL_ROLE_CONFLICT'))return NextResponse.json({error:'Bu e-posta CMS içinde mentor dışında bir role ait. Kullanıcı hesabını kontrol etmeden başvuruyu onaylayamazsınız.'},{status:409});return apiError(e,'Başvuru sonucu kaydedilemedi.');}
}
