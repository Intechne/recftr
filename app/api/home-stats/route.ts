import { NextResponse } from "next/server";
import { getPublicHomeStats } from "@/lib/db";
import { apiError } from "@/lib/api-server";

export const dynamic="force-dynamic";
export async function GET(){
  try{return NextResponse.json(await getPublicHomeStats());}
  catch(e){return apiError(e,"Ana sayfa istatistikleri alınamadı.");}
}
