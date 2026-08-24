import {PageHead} from "@/components/Ui";
import TeamDirectory from "@/components/public/TeamDirectory";
import {listTeams} from "@/lib/db";
export const dynamic="force-dynamic";
export const revalidate=0;
export default async function TakimlarPage(){const items=await listTeams(false);return <div className="pb-20"><PageHead kicker="TAKIM DİZİNİ" title="RECF TÜRKİYE TAKIMLARI" sub="Yayına açık aktif takımları program, okul, şehir veya takım numarasına göre bul."/><TeamDirectory initialItems={items as any[]}/></div>}
