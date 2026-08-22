import {NextRequest,NextResponse} from "next/server";
import {docsSession,portalSession} from "@/lib/auth";
import {createTeamDoc,deleteTeamDoc,getTeamDoc,listTeamDocs,updateTeamDoc} from "@/lib/db";
import {createPrivateDownload,DOC_MIME,PRIVATE_BUCKET,removeObject,safeStoragePath,verifyStoredObject} from "@/lib/storage";
import {apiError} from "@/lib/api-server";
import {cleanText} from "@/lib/security";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
  try{
    const download=Number(req.nextUrl.searchParams.get('download'));
    const portal=await portalSession(req);
    const cms=portal?null:await docsSession(req);
    if(!cms&&!portal)return NextResponse.json({error:'Yetkisiz'},{status:401});
    let teamNum=portal?.teamNum||cleanText(req.nextUrl.searchParams.get('teamNum'),20);
    if(portal) teamNum=portal.teamNum||'';
    const all=!!cms && req.nextUrl.searchParams.get('all')==='1';
    const docs=await listTeamDocs(all?undefined:teamNum);
    if(download){
      const d=docs.find((x:any)=>Number(x.id)===download);
      if(!d?.file_path)return NextResponse.json({error:'Dosya yok'},{status:404});
      if(portal && !safeStoragePath(String(d.file_path),`teams/${portal.teamNum}/documents`))return NextResponse.json({error:'Dosya yolu takımınıza ait değil.'},{status:403});
      return NextResponse.json({url:await createPrivateDownload(String(d.file_path),300)});
    }
    return NextResponse.json(docs);
  }catch(e){return apiError(e,'Takım belgeleri alınamadı.');}
}

export async function POST(req:NextRequest){
  try{
    const s=await portalSession(req);if(!s?.teamNum)return NextResponse.json({error:'Yetkisiz'},{status:401});
    const b=await req.json();
    const filePath=cleanText(b.file_path,500);
    if(!filePath||!safeStoragePath(filePath,`teams/${s.teamNum}/documents`))return NextResponse.json({error:'Yüklenen dosya yolu geçersiz veya bu takıma ait değil.'},{status:400});
    const verified=await verifyStoredObject(PRIVATE_BUCKET,filePath,DOC_MIME,20*1024*1024);
    if(!verified.ok)return NextResponse.json({error:verified.error},{status:400});
    if(b.id){
      const old:any=await getTeamDoc(Number(b.id),s.teamNum);if(!old)return NextResponse.json({error:'Belge bulunamadı'},{status:404});
      const r=await updateTeamDoc(Number(b.id),s.teamNum,{file_path:filePath,mime_type:verified.mime,status:'İNCELEMEDE',review_note:'',date_label:new Date().toLocaleDateString('tr-TR')});
      if(old.file_path&&old.file_path!==filePath&&safeStoragePath(String(old.file_path),`teams/${s.teamNum}/documents`))await removeObject(PRIVATE_BUCKET,old.file_path).catch(()=>{});
      return NextResponse.json(r,{status:201});
    }
    const name=cleanText(b.name,160);if(!name)return NextResponse.json({error:'Belge adı zorunlu'},{status:400});
    return NextResponse.json(await createTeamDoc(s.teamNum,{name,descr:cleanText(b.descr,1000),required:false,file_path:filePath,mime_type:verified.mime,status:'İNCELEMEDE',date_label:new Date().toLocaleDateString('tr-TR')}),{status:201});
  }catch(e){return apiError(e,'Takım belgesi kaydedilemedi.');}
}

export async function PATCH(req:NextRequest){
  try{
    const s=await docsSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:401});
    const b=await req.json();const teamNum=cleanText(b.team_num,20);
    if(!teamNum)return NextResponse.json({error:'Takım gerekli'},{status:400});
    const status=cleanText(b.status,30);if(!['EKSİK','İNCELEMEDE','ONAYLI','REDDEDİLDİ'].includes(status))return NextResponse.json({error:'Geçersiz belge durumu'},{status:400});
    return NextResponse.json(await updateTeamDoc(Number(b.id),teamNum,{status,review_note:cleanText(b.review_note,1000),date_label:new Date().toLocaleDateString('tr-TR')}));
  }catch(e){return apiError(e,'Belge inceleme sonucu kaydedilemedi.');}
}

export async function DELETE(req:NextRequest){
  try{
    const portal=await portalSession(req);const cms=portal?null:await docsSession(req);if(!portal&&!cms)return NextResponse.json({error:'Yetkisiz'},{status:401});
    const b=await req.json();const teamNum=portal?.teamNum||cleanText(b.team_num,20);if(!teamNum)return NextResponse.json({error:'Takım yok'},{status:400});
    const old:any=await getTeamDoc(Number(b.id),teamNum);if(!old)return NextResponse.json({error:'Belge yok'},{status:404});
    if(portal&&old.requirement_id)return NextResponse.json({error:'Zorunlu belge satırı silinemez; yeni dosya yükleyebilirsiniz.'},{status:400});
    const removed=await deleteTeamDoc(Number(b.id),teamNum);
    if(removed?.file_path&&safeStoragePath(String(removed.file_path),`teams/${teamNum}/documents`))await removeObject(PRIVATE_BUCKET,removed.file_path).catch(()=>{});
    return NextResponse.json({ok:true});
  }catch(e){return apiError(e,'Belge silinemedi.');}
}
