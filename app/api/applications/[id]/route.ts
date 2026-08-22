import { NextRequest, NextResponse } from "next/server";
import { approvalsSession } from "@/lib/auth";
import { audit, resolveApplication } from "@/lib/db";
import { apiError } from "@/lib/api-server";
export const dynamic="force-dynamic";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const s=await approvalsSession(req);if(!s)return NextResponse.json({error:"Yetkisiz"},{status:403});
    const {id}=await params;const {action}=await req.json();if(!["approve","reject"].includes(action))return NextResponse.json({error:"Geçersiz işlem"},{status:400});
    const out=await resolveApplication(Number(id),action);if(!out)return NextResponse.json({error:"Başvuru yok"},{status:404});
    await audit(s.email,action,"application",id,{num:out.app.num});return NextResponse.json({ok:true,num:out.app.num,action,temporaryPassword:out.temporaryPassword});
  }catch(e:any){const code=String(e?.message||'');if(code.includes('TEAM_NUM_USED'))return NextResponse.json({error:'Bu takım numarası başka bir onaylı takım tarafından kullanılıyor. Başvuru onaylanmadı.'},{status:409});if(code.includes('EMAIL_ROLE_CONFLICT'))return NextResponse.json({error:'Bu e-posta CMS içinde mentor dışında bir role ait. Kullanıcı hesabını kontrol etmeden başvuruyu onaylayamazsınız.'},{status:409});return apiError(e,'Başvuru sonucu kaydedilemedi.');}
}
