import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Hakkımızda", description: "RECF Türkiye, Robotics Education & Competition Foundation programlarının Türkiye operasyonudur; Intechne Teknoloji A.Ş. tarafından yürütülür.", path: "/hakkimizda" });
import {PageHead} from "@/components/Ui";
import AboutContent from "@/components/public/AboutContent";
import {getCachedPage,getCachedPublicSettings,getCachedStaff} from "@/lib/public-cache";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function HakkimizdaPage(){
  const [settings,staff,about]=await Promise.all([
    getCachedPublicSettings(),
    getCachedStaff(),
    getCachedPage('hakkimizda'),
  ]);
  return <div className="pb-20"><PageHead kicker="KURUMSAL" title={String((about as any)?.title||"RECF TÜRKİYE HAKKINDA").toUpperCase()}/><AboutContent settings={settings} staff={staff as any[]} about={about}/></div>;
}
