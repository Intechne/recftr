import {NextRequest,NextResponse} from "next/server";
import {contentSession} from "@/lib/auth";
import {addDocument,audit,deleteDocument,getDocument,listDocuments,updateDocument} from "@/lib/db";
import {DOC_MIME,PUBLIC_BUCKET,publicUrlMatchesPath,removeObject,safeStoragePath,verifyStoredObject} from "@/lib/storage";
import {apiError} from "@/lib/api-server";
import {cleanText,validHttpUrl} from "@/lib/security";
export const dynamic="force-dynamic";
async function normalizedBody(b:any){
  const name=cleanText(b.name,180),cat=cleanText(b.cat,80),file_path=cleanText(b.file_path,500),url=cleanText(b.url,1200);
  if(!name||!cat||!url)return {error:'Ad, kategori ve dosya/URL zorunlu'} as any;
  if(file_path){
    if(!safeStoragePath(file_path,'documents')||!publicUrlMatchesPath(url,file_path))return {error:'Yüklenen doküman yolu geçersiz.'} as any;
    const verified=await verifyStoredObject(PUBLIC_BUCKET,file_path,DOC_MIME,50*1024*1024);if(!verified.ok)return {error:verified.error} as any;
    return {...b,name,cat,file_path,url,mime_type:verified.mime,size_label:b.size_label||`${Math.max(1,Math.round(verified.size/1024))} KB`,updated_label:cleanText(b.updated_label,40)};
  }
  if(!validHttpUrl(url,true))return {error:'Harici doküman URL geçersiz.'} as any;
  return {...b,name,cat,file_path:'',url,mime_type:'',size_label:cleanText(b.size_label,40),updated_label:cleanText(b.updated_label,40)};
}
export async function GET(req:NextRequest){try{const all=req.nextUrl.searchParams.get('all')==='1';if(all&&!(await contentSession(req)))return NextResponse.json({error:'Yetkisiz'},{status:403});return NextResponse.json(await listDocuments(all));}catch(e){return apiError(e,'Dokümanlar alınamadı.');}}
export async function POST(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:'CMS içerik düzenleme yetkisi gerekli.'},{status:403});const b:any=await normalizedBody(await req.json());if(b.error)return NextResponse.json({error:b.error},{status:400});const r=await addDocument(b);await audit(s.email,'create','document',String(r.id),{name:b.name});return NextResponse.json(r,{status:201});}catch(e){return apiError(e,'Doküman kaydedilemedi.');}}
export async function PUT(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:403});const input=await req.json();const b:any=await normalizedBody(input);if(b.error)return NextResponse.json({error:b.error},{status:400});const old:any=await getDocument(Number(input.id));const r=await updateDocument(Number(input.id),b);if(old?.file_path&&old.file_path!==r?.file_path&&safeStoragePath(String(old.file_path),'documents'))await removeObject(PUBLIC_BUCKET,old.file_path).catch(()=>{});await audit(s.email,'update','document',String(input.id),{name:b.name});return NextResponse.json(r);}catch(e){return apiError(e,'Doküman güncellenemedi.');}}
export async function DELETE(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:403});const {id}=await req.json();const old=await deleteDocument(Number(id));if(old?.file_path&&safeStoragePath(String(old.file_path),'documents'))await removeObject(PUBLIC_BUCKET,old.file_path).catch(()=>{});await audit(s.email,'delete','document',String(id));return NextResponse.json({ok:true});}catch(e){return apiError(e,'Doküman silinemedi.');}}
