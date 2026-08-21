import { NextRequest, NextResponse } from "next/server";
import { approvalsSession, portalSession } from "@/lib/auth";
import { cancelEventRegistration, listEventRegistrations, registerEvent, updateEventRegistration } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){const p=await portalSession(req);if(p?.teamNum)return NextResponse.json(await listEventRegistrations(undefined,p.teamNum));if(!(await approvalsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const eventId=Number(req.nextUrl.searchParams.get("eventId"))||undefined;return NextResponse.json(await listEventRegistrations(eventId));}
export async function POST(req:NextRequest){const p=await portalSession(req);if(!p?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});try{return NextResponse.json(await registerEvent(p.teamNum,Number((await req.json()).eventId)),{status:201});}catch(e:any){return NextResponse.json({error:e.message||"Kayıt yapılamadı"},{status:400});}}
export async function DELETE(req:NextRequest){const p=await portalSession(req);if(!p?.teamNum)return NextResponse.json({error:"Yetkisiz"},{status:401});await cancelEventRegistration(p.teamNum,Number((await req.json()).eventId));return NextResponse.json({ok:true});}
export async function PATCH(req:NextRequest){if(!(await approvalsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const b=await req.json();return NextResponse.json(await updateEventRegistration(Number(b.id),b));}
