import {NextRequest,NextResponse} from "next/server";
import {contentSession} from "@/lib/auth";
import {audit,deleteProgram,getProgram,listPrograms,saveProgram} from "@/lib/db";
import {pathFromPublicUrl,PUBLIC_BUCKET,removeObject} from "@/lib/storage";
export const dynamic="force-dynamic";
async function cleanup(url?:string){const p=pathFromPublicUrl(url);if(p)await removeObject(PUBLIC_BUCKET,p).catch(()=>{});}
export async function GET(req:NextRequest){const all=req.nextUrl.searchParams.get('all')==='1';if(all&&!(await contentSession(req)))return NextResponse.json({error:'Yetkisiz'},{status:401});return NextResponse.json(await listPrograms(all));}
export async function POST(req:NextRequest){const s=await contentSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:401});const b=await req.json();if(!b.slug||!b.code||!b.name)return NextResponse.json({error:'Slug, kod ve ad zorunlu'},{status:400});const old:any=await getProgram(String(b.slug),true);const r=await saveProgram(b);if(old?.cover_url&&old.cover_url!==r.cover_url)await cleanup(old.cover_url);await audit(s.email,'save','program',r.slug,{name:r.name});return NextResponse.json(r,{status:201});}
export async function DELETE(req:NextRequest){const s=await contentSession(req);if(!s)return NextResponse.json({error:'Yetkisiz'},{status:401});const {slug}=await req.json();const old:any=await getProgram(String(slug),true);await deleteProgram(String(slug));if(old?.cover_url)await cleanup(old.cover_url);await audit(s.email,'disable','program',String(slug));return NextResponse.json({ok:true});}
