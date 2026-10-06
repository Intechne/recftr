import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "Mentor ve Takım Başvurusu", description: "RECF Türkiye takım ve mentor ön başvurusu. Programını seç, takım bilgilerini paylaş; başvurun alındığında e-posta ile bilgilendiril.", path: "/kayit" });
import {PageHead} from "@/components/Ui";
import RegistrationForm from "@/components/public/RegistrationForm";
import {getCachedPrograms} from "@/lib/public-cache";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function KayitPage({searchParams}:{searchParams:Promise<{program?:string|string[]}>}){
  const query=await searchParams;
  const requestedProgram=typeof query.program==="string"?query.program:undefined;
  const rows=await getCachedPrograms();
  const programs=(rows as any[]).map(x=>({...x,ageDetail:x.age_detail||x.ageDetail}));
  return <div className="pb-20"><PageHead kicker="SEZON 2026–27 BAŞVURUSU" title="TAKIM BAŞVURUSU"/><RegistrationForm key={requestedProgram||"default"} initialPrograms={programs} requestedProgram={requestedProgram}/></div>;
}
