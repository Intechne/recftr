import {PageHead} from "@/components/Ui";
import AboutContent from "@/components/public/AboutContent";
import {getPage,getSettings,listPublicStaff} from "@/lib/db";
import {PUBLIC_SETTING_KEYS} from "@/lib/content-consistency";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function HakkimizdaPage(){
  const [settings,staff,about]=await Promise.all([
    getSettings(PUBLIC_SETTING_KEYS),
    listPublicStaff(),
    getPage('hakkimizda'),
  ]);
  return <div className="pb-20"><PageHead kicker="KURUMSAL" title={String((about as any)?.title||"RECF TÜRKİYE HAKKINDA").toUpperCase()}/><AboutContent settings={settings} staff={staff as any[]} about={about}/></div>;
}
