import {PageHead} from "@/components/Ui";
import EventDirectory from "@/components/public/EventDirectory";
import {getCachedEvents} from "@/lib/public-cache";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function Page(){
  const list=await getCachedEvents();
  return <div className="pb-20"><PageHead kicker="2026–27 SEZONU" title="ETKİNLİKLER" sub="CMS üzerinden yayınlanan resmi etkinlik takvimi ve canlı kontenjan bilgileri."/><EventDirectory initialItems={list as any[]}/></div>;
}
