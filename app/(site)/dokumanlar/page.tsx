import {PageHead} from "@/components/Ui";
import DocumentDirectory from "@/components/public/DocumentDirectory";
import {getCachedDocuments} from "@/lib/public-cache";
export const dynamic="force-dynamic";
export const revalidate=0;
export default async function DokumanlarPage(){const items=await getCachedDocuments();return <div className="pb-20"><PageHead kicker="BİLGİ MERKEZİ" title="DOKÜMANLAR" sub="Sezon dokümanları, teknik dokümantasyon, koç kaynakları ve marka kiti — tek yerde."/><DocumentDirectory initialItems={items as any[]}/></div>}
