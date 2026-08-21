import {NextRequest,NextResponse} from "next/server";
import {contentSession} from "@/lib/auth";
import {audit,deleteEvent,getEvent,listEvents,slugify,upsertEvent} from "@/lib/db";
import {pathFromPublicUrl,PUBLIC_BUCKET,removeObject} from "@/lib/storage";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";
async function cleanup(url?:string){const p=pathFromPublicUrl(url);if(p)await removeObject(PUBLIC_BUCKET,p).catch(()=>{});}
export async function GET(req:NextRequest){try{const all=req.nextUrl.searchParams.get('all')==='1';if(all&&!(await contentSession(req)))return NextResponse.json({error:'Yetkisiz'},{status:401});return NextResponse.json(await listEvents(all));}catch(e){return apiError(e,'Etkinlikler alınamadı.');}}
export async function POST(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:'CMS içerik düzenleme yetkisi gerekli.'},{status:401});const b=await req.json();const slug=slugify(b.slug||b.title||'');if(!slug||!b.title||!b.code||!b.city)return NextResponse.json({error:'Başlık, program ve şehir zorunlu'},{status:400});const old:any=await getEvent(slug,true);const r=await upsertEvent({...b,slug});if(old?.cover_url&&old.cover_url!==r.cover_url)await cleanup(old.cover_url);await audit(s.email,'save','event',slug,{title:b.title});return NextResponse.json(r,{status:201});}catch(e){return apiError(e,'Etkinlik kaydedilemedi. Migration ve veritabanı bağlantısını kontrol edin.');}}
export async function DELETE(req:NextRequest){try{const s=await contentSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:401});const {slug}=await req.json();const old:any=await getEvent(String(slug),true);await deleteEvent(String(slug));if(old?.cover_url)await cleanup(old.cover_url);await audit(s.email,'delete','event',String(slug));return NextResponse.json({ok:true});}catch(e){return apiError(e,'Etkinlik silinemedi.');}}
