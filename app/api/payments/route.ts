import { NextRequest, NextResponse } from "next/server";
import { approvalsSession, portalSession } from "@/lib/auth";
import { deletePayment, listPayments, savePayment } from "@/lib/db";
import {apiError} from "@/lib/api-server";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){try{const p=await portalSession(req);if(p?.teamNum)return NextResponse.json(await listPayments(p.teamNum));if(!(await approvalsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await listPayments(req.nextUrl.searchParams.get("teamNum")||undefined));}catch(e){return apiError(e,'Ödemeler alınamadı.');}}
export async function POST(req:NextRequest){try{if(!(await approvalsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});return NextResponse.json(await savePayment(await req.json()),{status:201});}catch(e){return apiError(e,'Ödeme kaydedilemedi.');}}
export async function DELETE(req:NextRequest){try{if(!(await approvalsSession(req)))return NextResponse.json({error:"Yetkisiz"},{status:401});const {id}=await req.json();await deletePayment(Number(id));return NextResponse.json({ok:true});}catch(e){return apiError(e,'Ödeme silinemedi.');}}
