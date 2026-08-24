import {PageHead} from "@/components/Ui";
import NewsDirectory from "@/components/public/NewsDirectory";
import {getCachedNews} from "@/lib/public-cache";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function DuyurularPage(){
  const items=await getCachedNews();
  return <div className="pb-20"><PageHead kicker="HABER MERKEZİ" title="DUYURULAR & HABERLER" sub="RECF Türkiye’den sezon, etkinlik, takım ve program gelişmeleri."/><NewsDirectory initialItems={items as any[]}/></div>;
}
