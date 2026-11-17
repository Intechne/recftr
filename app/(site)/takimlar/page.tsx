import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import {PageHead} from "@/components/Ui";
import TeamDirectory from "@/components/public/TeamDirectory";
import {getCachedFoundingCount,getCachedTeams} from "@/lib/public-cache";
export const metadata: Metadata = pageMeta({ title: "Takımlar — Founding 100", description: "RECF Türkiye kurucu takımları: Founding 100 listesinde yayın onamı veren takımların adı, okulu ve ili.", path: "/takimlar" });
export const dynamic="force-dynamic";
export const revalidate=0;
export default async function TakimlarPage(){const [items,foundingCount]=await Promise.all([getCachedTeams(),getCachedFoundingCount().catch(()=>null)]);return <div className="pb-20"><PageHead kicker="FOUNDING 100" title="KURUCU TAKIMLAR" sub="RECF Türkiye’nin ilk sezonunu birlikte yazan takımlar. Listede yalnız yayın onamı veren ve ekibimizce onaylanan takımların adı, okulu ve ili yer alır."/><TeamDirectory initialItems={items as any[]} foundingCount={foundingCount}/></div>}
