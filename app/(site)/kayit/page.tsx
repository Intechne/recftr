import {PageHead} from "@/components/Ui";
import RegistrationForm from "@/components/public/RegistrationForm";
import {getCachedPrograms,getCachedRegistrationPricing} from "@/lib/public-cache";

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function KayitPage(){
  const [rows,s]=await Promise.all([getCachedPrograms(),getCachedRegistrationPricing()]);
  const programs=(rows as any[]).map(x=>({...x,ageDetail:x.age_detail||x.ageDetail}));
  const pricing={fees:{engage:Number(s.registration_fee_engage)||0,achieve:Number(s.registration_fee_achieve)||0,inspire:Number(s.registration_fee_inspire)||0,adc:Number(s.registration_fee_adc)||0,'adc-pro':Number(s['registration_fee_adc-pro'])||0},fieldKitFee:Number(s.field_kit_fee)||0,discount:Number(s.registration_discount)||0};
  return <div className="pb-20"><PageHead kicker="SEZON 2026–27 BAŞVURUSU" title="TAKIM KAYDI"/><RegistrationForm initialPrograms={programs} initialPricing={pricing}/></div>;
}
