import type {Metadata} from "next";
import Link from "next/link";
import {pageMeta} from "@/lib/seo";
import {FigmaIcon} from "@/components/FigmaIcon";
import {getCachedStaff} from "@/lib/public-cache";
import CmsImage from "@/components/public/CmsImage";

export const metadata:Metadata=pageMeta({title:"Planlama Komitesi",description:"RECF Türkiye Planlama Komitesi: sezon, etkinlik ve program süreçlerini yürüten ekip. Gönüllü olmak isteyenler için Gönüllü Ağı.",path:"/planlama-komitesi"});
export const dynamic="force-dynamic";

type Staff={id:number;name:string;public_title:string;public_bio:string;public_photo_url:string};

export default async function PlanningCommitteePage(){
  // Ekip ve unvanlar CMS → Ekip & Yetkiler'de "public profil" olarak işaretlenen kişilerden gelir (Hakkımızda ile aynı kaynak).
  const staff=(await getCachedStaff()) as Staff[];
  return <div className="pb-20">
    <section className="field-grid relative overflow-hidden border-b-2 border-ink">
      <div className="safe-x mx-auto max-w-7xl py-12 lg:px-10 lg:py-20">
        <p className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 font-display text-xs font-bold tracking-[1.5px] text-cyan-brand"><FigmaIcon name="ittifak" className="h-5 w-5"/> PLANLAMA KOMİTESİ</p>
        <h1 className="mt-5 font-display text-[clamp(2.5rem,8vw,4.75rem)] font-bold leading-[.98]">SEZONU PLANLAYAN<br/><span className="text-cyan-deep">EKİP.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/65">RECF Türkiye Planlama Komitesi; sezon takvimini, etkinlik hazırlıklarını ve program süreçlerini RECF’in resmî kuralları doğrultusunda planlar ve yürütür.</p>
      </div>
    </section>
    <div className="safe-x mx-auto max-w-7xl lg:px-10">
      <section className="py-12" aria-labelledby="komite-ekip">
        <h2 id="komite-ekip" className="font-display text-3xl font-bold">KOMİTE ÜYELERİ</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{staff.map(member=><article key={member.id} className="overflow-hidden rounded-xl border border-ink/15 bg-white"><div className="relative h-48 bg-ink">{member.public_photo_url?<CmsImage src={member.public_photo_url} alt={member.name} sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover"/>:<div className="flex h-full items-center justify-center font-display text-3xl font-bold text-cyan-brand">{member.name.split(/\s+/).map(part=>part[0]).slice(0,2).join("")}</div>}</div><div className="p-4"><h3 className="font-display text-base font-bold">{member.name}</h3>{member.public_title&&<p className="mt-1 font-display text-[11px] font-semibold tracking-wider text-cyan-deep">{member.public_title}</p>}{member.public_bio&&<p className="mt-2 text-xs leading-relaxed text-ink/65">{member.public_bio}</p>}</div></article>)}
          {staff.length===0&&<p className="col-span-full rounded-xl border border-ink/15 bg-white p-7 text-ink/65">Komite üyelerinin tanıtımı yakında burada paylaşılacak.</p>}</div>
      </section>
      <section id="basvuru" className="scroll-mt-28 flex flex-col gap-5 rounded-xl border-2 border-ink bg-cyan-brand/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">GÖNÜLLÜ OLMAK İSTER MİSİN?</p><h2 className="mt-2 font-display text-2xl font-bold">GÖNÜLLÜ BAŞVURULARI ARTIK GÖNÜLLÜ AĞI’NDA.</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">Etkinlik, eğitim, teknik hazırlık ve iletişim alanlarında gönüllü olmak ya da Hakem ve Jüri Akademisi’ne başvurmak için Gönüllü Ağı sayfasını kullan.</p></div>
        <Link href="/gonullu#basvuru" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold text-white shadow-plateSm shadow-cyan-brand">GÖNÜLLÜ AĞI’NA GİT →</Link>
      </section>
    </div>
  </div>;
}
