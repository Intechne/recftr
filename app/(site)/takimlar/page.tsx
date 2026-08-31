import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Takımlar", description: "RECF Türkiye'ye kayıtlı robotik ve drone takımları — şehir ve program dizini.", path: "/takimlar" });
import {PageHead} from "@/components/Ui";
import TeamDirectory from "@/components/public/TeamDirectory";
import {getCachedTeams} from "@/lib/public-cache";
export const dynamic="force-dynamic";
export const revalidate=0;
export default async function TakimlarPage(){const items=await getCachedTeams();return <div className="pb-20"><PageHead kicker="TAKIM DİZİNİ" title="RECF TÜRKİYE TAKIMLARI" sub="Yayına açık aktif takımları program, okul, şehir veya takım numarasına göre bul."/><TeamDirectory initialItems={items as any[]}/></div>}
