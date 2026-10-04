import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Etkinlik Takvimi", description: "RECF Türkiye etkinlik takvimi: yaklaşan ve geçmiş etkinlikler, duyurulmuş tarihler ve katılım bilgileri.", path: "/etkinlikler" });
import {PageHead} from "@/components/Ui";
import EventDirectory from "@/components/public/EventDirectory";
import {getCachedEvents} from "@/lib/public-cache";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function Page(){
  const list=await getCachedEvents();
  return <div className="pb-20"><PageHead kicker="2026–27 SEZONU" title="ETKİNLİKLER" sub="Yaklaşan ve geçmiş etkinlikler, duyurulmuş tarihler ve katılım bilgileri."/><EventDirectory initialItems={list as any[]}/></div>;
}
