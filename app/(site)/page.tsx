import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
export const metadata: Metadata = pageMeta({ title: "RECF Türkiye — Maç Günü. Her Gün.", description: "Türkiye'nin resmi RECF robotik ve drone programları: Engage, Achieve, Inspire, Aerial Drone Competition, ADC Pro. Takım başvurunu yap, RECF STEM World Championship'e giden yolculuğa başla.", path: "/", languages: languageAlternates("/", "/en", abs) });
import { abs } from "@/lib/seo";
import { languageAlternates } from "@/lib/i18n";
import { publicRoute, type RouteStep } from "@/lib/season-route";
import { FOUNDING_100, TEAM_MAP_DEFAULT_MIN_TEAMS, programGameLabel, settingNumber, worldChampionship } from "@/lib/site-config";
import TurkeyTeamMap from "@/components/public/TurkeyTeamMap";
import { SafeLink } from "@/components/public/RichText";
import CmsImage from "@/components/public/CmsImage";
import { badgeStyleOnDark } from "@/lib/color";
import { videoEmbedUrl } from "@/lib/embed";
import { copy } from "@/lib/copy";
import Link from "next/link";
import { getCachedHomeSnapshot } from "@/lib/public-cache";
import { eventPhase } from "@/lib/public-content";
import { FigmaIcon, type FigmaIconName } from "@/components/FigmaIcon";
import { CountUp, Reveal, RoutePath } from "@/components/Motion";

type Program = {
  slug:string; code:string; name:string; game?:string; age?:string; color_hex?:string;
  short?:string; cover_url?:string;
};
type Event = {
  id:number|string; slug:string; code?:string; title:string; cover_url?:string;
  event_start?:string; event_end?:string; date_label?:string; city?:string; venue?:string; capacity?:number; status?:string;
};
type News = {
  id:number|string; slug:string; tag?:string; title:string; excerpt?:string;
  cover_url?:string; date?:string;
};
type Media = {
  id:number|string; type?:string; url:string; alt_text?:string; title?:string; caption?:string;
};
type HomeStats = { teams:number; cities:number; events:number; students:number; programs:number; founding?:number };
type Settings = {
  hero_title?:string; hero_accent_title?:string; hero_description?:string; hero_image?:string;
  season_label?:string; season_route_title?:string; season_route?:string;
  home_cta_title?:string; home_cta_description?:string; home_cta_plate?:string;
  home_show_programs?:string; home_show_route?:string; home_show_stats?:string;
  home_show_events?:string; home_show_news?:string; home_show_gallery?:string; home_show_cta?:string;
  home_show_team_map?:string; home_show_recf_news?:string; founding100_min_display?:string; team_map_min_teams?:string;
  recf_message_kind?:string; recf_message_url?:string; recf_message_title?:string; recf_message_text?:string; wc_date_label?:string; wc_date_label_en?:string;
};

const EMPTY_STATS:HomeStats={teams:0,cities:0,events:0,students:0,programs:0,founding:0};

function enabled(settings:Settings,key:keyof Settings){ return settings[key] !== "false"; }
function programIcon(p:Program):FigmaIconName { return /ADC|PRO/i.test(p.code||"") ? "drone" : "robot"; }
function isVideo(m?:Media){ const t=String(m?.type||"").toLocaleLowerCase("tr-TR"); return !!m && ((t==="video"||t==="vıdeo") || /\.(mp4|webm|mov)(\?|$)/i.test(m.url||"")); }
function fmtDate(date?:string){ if(!date)return ""; try{return new Date(date).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}catch{return date} }

export const dynamic="force-dynamic";
export const revalidate=0;

export default async function Home() {
  let snapshot:any={programs:[],events:[],news:[],media:[],settings:{},stats:EMPTY_STATS};
  try {
    snapshot=await getCachedHomeSnapshot();
  } catch {
    // Never turn a transient database/cache delay into a 504 for the public homepage.
  }
  const programs=(Array.isArray(snapshot.programs)?snapshot.programs:[]) as Program[];
  const events=((Array.isArray(snapshot.events)?snapshot.events:[]) as Event[]).filter(e=>eventPhase(e)!=="past");
  const news=(Array.isArray(snapshot.news)?snapshot.news:[]) as News[];
  const media=(Array.isArray(snapshot.media)?snapshot.media:[]) as Media[];
  const settings=(snapshot.settings&&typeof snapshot.settings==='object'?snapshot.settings:{}) as Settings;
  const stats=(snapshot.stats&&typeof snapshot.stats==='object'?snapshot.stats:EMPTY_STATS) as HomeStats;
  const route:RouteStep[]=publicRoute(settings.season_route,Date.now(),worldChampionship(settings as Record<string,unknown>));
  const recfUrl=String(settings.recf_message_url||"").trim();
  const recfMessage=/^https:\/\//.test(recfUrl)?{url:recfUrl,embed:settings.recf_message_kind==="video"?videoEmbedUrl(recfUrl):null,title:String(settings.recf_message_title||"").trim(),text:String(settings.recf_message_text||"").trim()}:null;
  const recfNews=(Array.isArray(snapshot.recfNews)?snapshot.recfNews:[]) as News[];
  const teamCities=(Array.isArray(snapshot.teamCities)?snapshot.teamCities:[]) as {city:string;count:number}[];
  const season=settings.season_label||"2026–27";
  const rawHero=(settings.hero_title||"MAÇ GÜNÜ HER GÜN.").trim();
  const inferredAccent=/HER GÜN\.?$/i.test(rawHero)?(rawHero.match(/HER GÜN\.?$/i)?.[0]||""):"";
  const heroAccent=(settings.hero_accent_title||inferredAccent||"HER GÜN.").trim();
  const heroMain=inferredAccent&&rawHero.toLowerCase().endsWith(inferredAccent.toLowerCase())?rawHero.slice(0,-inferredAccent.length).trim():rawHero;
  const featureMedia=media[0];
  const secondaryMedia=media.slice(1,7);
  // Founding 100: Supabase'deki aktif (onaylı) takım sayısı, 100 ile sınırlı. Eşik CMS'ten ayarlanır.
  const founding=Math.min(FOUNDING_100.target,Math.max(0,Number(stats.founding)||0));
  const foundingMin=settingNumber(settings.founding100_min_display,FOUNDING_100.defaultMinDisplay,1,FOUNDING_100.target);
  const showFounding=enabled(settings,"home_show_stats")&&founding>=foundingMin;
  const mapTeams=teamCities.reduce((sum,row)=>sum+(Number(row.count)||0),0);
  const showMap=enabled(settings,"home_show_team_map")&&mapTeams>=settingNumber(settings.team_map_min_teams,TEAM_MAP_DEFAULT_MIN_TEAMS,1);

  return <>
    {/* HERO — eski yayın tasarımının hareketli ritmi + CMS verisi */}
    <section className="field-grid relative overflow-hidden">
      <div aria-hidden className="home-orbit home-orbit-red absolute -left-16 bottom-5 h-28 w-28 rotate-45 bg-alliance-red/90 sm:-left-24 sm:h-40 sm:w-40"/>
      <div aria-hidden className="home-orbit home-orbit-blue absolute -right-16 -top-14 h-36 w-36 rotate-45 bg-alliance-blue/90 sm:-right-24 sm:-top-24 sm:h-56 sm:w-56"/>
      <div className="safe-x mx-auto grid max-w-7xl items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1.12fr_.88fr] lg:gap-12 lg:px-10 lg:py-24 2xl:gap-16 2xl:py-28">
        <div className="relative z-10">
          <span className="rise rise-1 inline-flex min-h-9 items-center gap-2 rounded bg-ink px-3.5 py-2 font-display text-xs font-semibold tracking-[1.5px] text-cyan-brand sm:text-[12px]">
            <FigmaIcon name="robot" className="h-4 w-4"/> RESMİ RECF TÜRKİYE PLATFORMU
          </span>
          <h1 className="mt-5 font-display font-bold leading-[.94] sm:mt-6">
            <span className="rise rise-2 block text-[clamp(2.9rem,14vw,5.2rem)] text-ink lg:text-[88px] 2xl:text-[102px]">{heroMain}</span>
            {heroAccent&&<span className="rise rise-3 block text-[clamp(2.9rem,14vw,5.2rem)] text-cyan-brand lg:text-[88px] 2xl:text-[102px]" style={{WebkitTextStroke:"clamp(1px,.16vw,2px) #10192F"}}>{heroAccent}</span>}
          </h1>
          <p className="rise rise-4 mt-5 max-w-xl text-[15px] leading-relaxed text-ink/65 sm:mt-6 sm:text-[17px] lg:text-[18px] 2xl:max-w-2xl 2xl:text-[19px]">{settings.hero_description||"Türkiye’nin robotik ve drone yarışma programları. Programını seç, takım başvurunu yap, sezon rotasına katıl."}</p>
          <div className="rise rise-4 mt-7 flex flex-col gap-3 min-[460px]:flex-row sm:mt-8">
            <Link href="/kayit" className="flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-[13px] font-bold text-white shadow-plateSm shadow-cyan-brand transition-transform hover:-translate-y-0.5"><FigmaIcon name="kayit" className="h-5 w-5"/> {copy().apply}</Link>
            <Link href="/programlar" className="flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-ink bg-white px-5 py-3 font-display text-[13px] font-bold transition-transform hover:-translate-y-0.5"><FigmaIcon name="kupa" className="h-5 w-5"/> PROGRAMLARI GÖR</Link>
          </div>
        </div>

        <Reveal className="relative z-10">
          <div className="overflow-hidden rounded-2xl border-2 border-ink bg-ink shadow-[0_24px_60px_rgba(6,12,26,.28)]">
            {settings.hero_image&&<div className="relative h-32 overflow-hidden border-b border-white/10 sm:h-40 2xl:h-48"><CmsImage src={settings.hero_image} alt="RECF Türkiye sezonu" sizes="(min-width:1024px) 40vw, 100vw" priority className="object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"/></div>}
            <div className="flex items-center justify-between bg-white/5 px-4 py-3.5 sm:px-5 sm:py-4">
              <span className="flex items-center gap-2 font-display text-[13px] font-bold text-cyan-brand sm:text-[15px]"><FigmaIcon name="kupa" className="h-5 w-5"/> SEZON OYUNLARI {season}</span>
              <span className="rounded-[3px] bg-cyan-brand px-2.5 py-1 font-display text-xs font-bold text-ink">CANLI</span>
            </div>
            <div className="px-2 py-2">
              {programs.slice(0,5).map(p=><Link key={p.slug} href={`/programlar/${p.slug}`} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5 sm:gap-3.5">
                <span className="flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md font-display text-sm font-bold" style={badgeStyleOnDark(p.color_hex)}>{p.code}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-display text-[15px] font-bold text-white sm:text-[17px]">{programGameLabel(p.slug,p.game)||p.name}</span><span className="block truncate text-xs text-white/65 sm:text-[12px]">{p.age||p.name}</span></span>
                <span className="text-cyan-brand transition-transform group-hover:translate-x-1">→</span>
              </Link>)}
              {programs.length===0&&<p className="px-3 py-6 text-sm text-white/65">Yayınlanmış program verisi bekleniyor.</p>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* PROGRAM PLAKALARI */}
    {enabled(settings,"home_show_programs")&&<section className="bg-white">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between sm:mb-10">
          <h2 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[36px] lg:text-[44px]">PROGRAMINI SEÇ.<br/><span className="text-cyan-deep">SAHAYA ÇIK.</span></h2>
          <p className="max-w-md text-[14px] leading-relaxed text-ink/65 md:text-right sm:text-[15px]">Yaş grubuna ve ilgi alanına uygun programı seç; sezon oyununu ve katılım koşullarını incele.</p>
        </div>
        <div className="grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:gap-5">
          {programs.map((p,i)=><Reveal key={p.slug} delay={i*70} className="h-full"><Link href={`/programlar/${p.slug}`} className="plate-hover flex h-full flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate" style={{["--tw-shadow-color" as string]:p.color_hex||"#29B9E5"}}>
            <div className="flex min-h-20 items-center justify-between p-4 text-white" style={{backgroundColor:p.color_hex||"#29B9E5"}}><span className="font-display text-[30px] font-bold">{p.code}</span><FigmaIcon name={programIcon(p)} className="h-9 w-9 opacity-90"/></div>
            <div className="flex flex-1 flex-col p-4"><p className="font-display text-xs font-medium tracking-[1.5px] text-ink/65">{p.age||"RECF PROGRAMI"}</p><h3 className="mt-1.5 font-display text-[19px] font-bold text-ink">{p.name}</h3><p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink/65">{p.game?`“${programGameLabel(p.slug,p.game)}” — `:""}{p.short||"Program detaylarını ve sezon bilgisini incele."}</p><p className="mt-auto pt-4 font-display text-[12px] font-semibold text-ink">PROGRAMA GİR →</p></div>
          </Link></Reveal>)}
        </div>
      </div>
    </section>}

    {/* SEZON ROTASI */}
    {enabled(settings,"home_show_route")&&<section className="overflow-hidden bg-paper">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex items-center gap-3"><FigmaIcon name="rota" className="h-8 w-8 text-ink"/><h2 className="font-display text-[27px] font-bold text-ink sm:text-[32px] lg:text-[38px]">{settings.season_route_title||"SEZON ROTASI"} <span className="text-cyan-deep">{season}</span></h2></div>
        <div className="relative mt-8 hidden lg:block">
          <RoutePath/>
          <FigmaIcon name="rota" className="route-fly absolute left-[39%] top-[36%] h-8 w-8 -rotate-12 text-ink"/>
          <div className="relative mt-1 h-36">
            {route.map((wp,i)=>{const left=route.length<=1?50:9+(i/(route.length-1))*82;return <div key={`${wp.month}-${i}`} className="absolute flex w-[200px] -translate-x-1/2 flex-col items-center text-center" style={{left:`${left}%`}}>
              <span className={`diamond h-5 w-5 rounded border-[2.5px] border-ink ${wp.done?"bg-cyan-brand":"bg-white"}`}/>
              <span className={`mt-2.5 font-display text-sm font-bold ${wp.done?"text-cyan-deep":"text-ink"}`}>{wp.month}</span>
              <span className="max-w-[190px] text-[12px] font-semibold text-ink/75 xl:text-[13px]">{wp.link?<SafeLink href={wp.link} className="underline decoration-ink/25 underline-offset-4 hover:text-cyan-deep">{wp.label}</SafeLink>:wp.label}</span>
              {wp.date_label&&<span className="mt-0.5 max-w-[190px] text-xs text-ink/65">{wp.date_label}{wp.status==="tbc"?" · teyit bekleniyor":""}</span>}
            </div>})}
          </div>
        </div>
        <ol className="mt-8 space-y-5 border-l-2 border-dashed border-ink/30 pl-6 lg:hidden">
          {route.map((wp,i)=><li key={`${wp.month}-${i}`} className="relative"><span className={`diamond absolute -left-[33px] top-1 h-4 w-4 rounded border-2 border-ink ${wp.done?"bg-cyan-brand":"bg-white"}`}/><span className="block font-display text-sm font-bold text-ink">{wp.month}</span><span className="block text-[14px] font-semibold text-ink/75">{wp.link?<SafeLink href={wp.link} className="underline decoration-ink/25 underline-offset-4">{wp.label}</SafeLink>:wp.label}</span>{wp.date_label&&<span className="block text-[13px] text-ink/65">{wp.date_label}{wp.status==="tbc"?" · teyit bekleniyor":""}</span>}</li>)}
        </ol>
      </div>
    </section>}

    {/* FOUNDING 100 — gerçek veriden; eşiğin altında gizli */}
    {showFounding&&<section className="field-grid-dark bg-ink" aria-labelledby="founding-100-title">
      <div className="safe-x mx-auto grid max-w-7xl items-center gap-8 py-12 lg:grid-cols-[1fr_1.1fr] lg:px-10 lg:py-14">
        <div><p className="inline-flex items-center gap-2 rounded bg-cyan-brand px-3 py-1.5 font-display text-xs font-bold tracking-[1.5px] text-ink"><FigmaIcon name="rozet" className="h-4 w-4"/> FOUNDING 100</p><h2 id="founding-100-title" className="mt-4 font-display text-[30px] font-bold leading-tight text-white sm:text-[38px]">TÜRKİYE’NİN KURUCU TAKIMLARI.</h2><p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/70">Sezonun ilk 100 takımı RECF Türkiye’nin kurucu kadrosunu oluşturuyor. Founding 100’de {founding} takım başvurdu — liste takımların yayın onamıyla güncellenir.</p><div className="mt-6 flex flex-col gap-3 min-[460px]:flex-row"><Link href="/kayit" className="inline-flex min-h-12 items-center justify-center rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink">{copy().apply}</Link><Link href="/takimlar" className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/40 px-5 py-3 font-display text-[13px] font-bold text-white hover:border-white">KURUCU TAKIMLAR →</Link></div></div>
        <Reveal><div className="rounded-2xl border-2 border-cyan-brand bg-white/[.04] p-6 sm:p-8"><p className="font-display text-[clamp(3.5rem,14vw,6.5rem)] font-bold leading-none text-cyan-brand"><CountUp to={founding}/><span className="text-white/65">/{FOUNDING_100.target}</span></p><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Founding 100 doluluk" aria-valuemin={0} aria-valuemax={FOUNDING_100.target} aria-valuenow={founding}><div className="h-full rounded-full bg-cyan-brand" style={{width:`${founding}%`}}/></div><p className="mt-3 font-display text-xs font-medium tracking-[1.7px] text-white/65">TAKIM BAŞVURDU</p></div></Reveal>
      </div>
    </section>}

    {/* YAKLAŞAN ETKİNLİKLER — masaüstünde skorboard/tablo, mobilde kart satırı */}
    {enabled(settings,"home_show_events")&&<section className="bg-white">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">SAHA TAKVİMİ</p><h2 className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">YAKLAŞAN ETKİNLİKLER</h2></div><Link href="/etkinlikler" className="inline-flex min-h-11 items-center gap-2 font-display text-[12px] font-bold text-cyan-deep"><FigmaIcon name="takvim" className="h-5 w-5"/> TÜM ETKİNLİKLER →</Link></div>
        <div className="mt-7 overflow-hidden rounded-xl border-2 border-ink">
          <div className="hidden bg-ink px-5 py-3.5 font-display text-xs font-semibold tracking-[1.3px] text-white/65 lg:grid lg:grid-cols-[110px_90px_1fr_240px_140px]"><span>TARİH</span><span>PROGRAM</span><span>ETKİNLİK</span><span>KONUM</span><span>DURUM</span></div>
          {events.slice(0,6).map((e,i)=><Reveal key={e.id} delay={i*55}><Link href={`/etkinlikler/${e.slug}`} className={`group grid gap-3 px-4 py-4 transition-colors hover:bg-cyan-brand/5 sm:px-5 lg:grid-cols-[110px_90px_1fr_240px_140px] lg:items-center ${i%2?"bg-paper/60":"bg-white"}`}>
            <span className="font-display text-[15px] font-bold text-ink">{e.date_label||"Tarih yakında"}</span>
            <span><span className="inline-flex min-w-14 items-center justify-center rounded bg-cyan-brand px-2 py-1 font-display text-xs font-bold text-ink">{e.code||"RECF"}</span></span>
            <span><span className="block font-semibold text-ink">{e.title}</span><span className="mt-0.5 block text-xs text-ink/40 lg:hidden">ETKİNLİK</span></span>
            <span className="flex items-center gap-2 text-[13px] text-ink/65"><FigmaIcon name="konum" className="h-4 w-4 shrink-0"/>{[e.city,e.venue].filter(Boolean).join(" · ")||"Konum yakında"}</span>
            <span className="flex items-center gap-2 font-display text-xs font-bold text-cyan-deep"><span className="pulse-soft h-2 w-2 rounded-full bg-cyan-brand"/>{e.status||"YAYINDA"}</span>
          </Link></Reveal>)}
          {events.length===0&&<p className="p-7 text-sm text-ink/65">Yaklaşan etkinlik henüz duyurulmadı. Geçmiş etkinlikleri takvimde inceleyebilirsin.</p>}
        </div>
      </div>
    </section>}

    {/* HABERLER */}
    {enabled(settings,"home_show_news")&&news.length>0&&<section className="bg-paper">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">HABER MERKEZİ</p><h2 className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">DUYURULAR & HABERLER</h2></div><Link href="/duyurular" className="flex items-center gap-2 font-display text-[12px] font-bold text-cyan-deep"><FigmaIcon name="anons" className="h-5 w-5"/> TÜM HABERLER →</Link></div>
        <div className="mt-7 grid gap-4 md:grid-cols-3 2xl:gap-5">{news.slice(0,3).map((n,i)=><Reveal key={n.slug} delay={i*80} className="h-full"><Link href={`/duyurular/${n.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink/20 bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="relative h-40 overflow-hidden bg-ink">{n.cover_url?<CmsImage src={n.cover_url} alt={n.title} sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105"/>:<div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2e4780] to-ink"><FigmaIcon name="anons" className="h-14 w-14 text-cyan-brand"/></div>}<span className="absolute left-3 top-3 rounded bg-cyan-brand px-2 py-1 font-display text-xs font-bold text-ink">{n.tag||"DUYURU"}</span></div>
          <div className="flex flex-1 flex-col p-5"><h3 className="font-semibold leading-snug text-ink">{n.title}</h3><p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink/65">{n.excerpt}</p><p className="mt-auto pt-4 font-display text-xs font-medium tracking-[1px] text-ink/40">{fmtDate(n.date).toUpperCase()}</p></div>
        </Link></Reveal>)}</div>
      </div>
    </section>}

    {/* RECF'TEN — CMS: Site Ayarları → RECF'ten bloğu (video / resmî paylaşım linki) ve "RECF'TEN" etiketli haberler. İçerik yoksa gizli. */}
    {enabled(settings,"home_show_recf_news")&&(recfMessage||recfNews.length>0)&&<section className="bg-white" aria-labelledby="recften-title">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20">
        <p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">RECF GLOBAL</p><h2 id="recften-title" className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">RECF’TEN</h2>
        {recfMessage&&<div className={`mt-7 grid gap-6 ${recfMessage.embed?"lg:grid-cols-[1.4fr_1fr] lg:items-center":""}`}>
          {recfMessage.embed&&<div className="relative aspect-video overflow-hidden rounded-xl border-2 border-ink bg-ink"><iframe src={recfMessage.embed} title={recfMessage.title||"RECF video mesajı"} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full"/></div>}
          <div className="rounded-xl border-2 border-ink bg-paper p-6">{recfMessage.title&&<h3 className="font-display text-[22px] font-bold leading-snug text-ink">{recfMessage.title}</h3>}{recfMessage.text&&<p className="mt-3 text-[15px] leading-relaxed text-ink/70">{recfMessage.text}</p>}{!recfMessage.embed&&<SafeLink href={recfMessage.url} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-ink px-4 py-2.5 font-display text-[12px] font-bold text-white">RECF PAYLAŞIMINI GÖR ↗</SafeLink>}</div>
        </div>}
        {recfNews.length>0&&<div className="mt-7 grid gap-4 md:grid-cols-3">{recfNews.slice(0,3).map(n=><Link key={n.slug} href={`/duyurular/${n.slug}`} className="group flex flex-col rounded-xl border-2 border-ink bg-paper p-5 transition-transform hover:-translate-y-1"><span className="font-display text-xs font-bold tracking-[1.5px] text-cyan-deep">{fmtDate(n.date).toUpperCase()}</span><h3 className="mt-2 font-display text-[18px] font-bold leading-snug text-ink">{n.title}</h3>{n.excerpt&&<p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-ink/65">{n.excerpt}</p>}<span className="mt-auto pt-4 font-display text-[12px] font-bold text-ink">OKU →</span></Link>)}</div>}
      </div>
    </section>}

    {/* TÜRKİYE TAKIM HARİTASI — eşiğin altında gizli */}
    {showMap&&<section className="bg-paper" aria-labelledby="team-map-title">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20">
        <p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">SAHA HARİTASI</p><h2 id="team-map-title" className="mt-1 mb-7 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">TÜRKİYE SAHADA.</h2>
        <TurkeyTeamMap counts={teamCities}/>
      </div>
    </section>}

    {/* SAHADAN — hareketli medya kompozisyonu */}
    {enabled(settings,"home_show_gallery")&&media.length>0&&<section className="bg-white">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">SAHADAN</p><h2 className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">ETKİNLİK GALERİSİ</h2></div><Link href="/galeri" className="flex items-center gap-2 font-display text-[12px] font-bold text-cyan-deep"><FigmaIcon name="yayin" className="h-5 w-5"/> TÜM GALERİ →</Link></div>
        <div className="mt-7 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
          {featureMedia&&<Link href="/galeri" className="group relative min-h-[260px] overflow-hidden rounded-xl border-2 border-ink bg-ink sm:min-h-[340px] lg:min-h-[410px]">
            {isVideo(featureMedia)?<video src={featureMedia.url} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-85"/>:<CmsImage src={featureMedia.url} alt={featureMedia.alt_text||featureMedia.title||"RECF Türkiye etkinlik fotoğrafı"} sizes="(min-width:1024px) 60vw, 100vw" className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"/>}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent"/><div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3"><div><span className="inline-flex items-center gap-2 rounded bg-ink/85 px-3 py-1.5 font-display text-xs font-semibold text-white"><FigmaIcon name="yayin" className="h-4 w-4 text-cyan-brand"/> ÖNE ÇIKAN MEDYA</span><p className="mt-2 max-w-xl font-display text-[17px] font-bold text-white sm:text-[20px]">{featureMedia.title||"RECF Türkiye sahadan"}</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-brand text-ink transition-transform group-hover:scale-110"><FigmaIcon name="rota" className="h-6 w-6"/></span></div>
          </Link>}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">{secondaryMedia.slice(0,2).map(m=><Link href="/galeri" key={m.id} className="group relative min-h-36 overflow-hidden rounded-xl border-2 border-ink bg-ink sm:min-h-44 lg:min-h-0">{isVideo(m)?<video src={m.url} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-85"/>:<CmsImage src={m.url} alt={m.alt_text||m.title||"RECF Türkiye etkinlik fotoğrafı"} sizes="(min-width:1024px) 35vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105"/>}<div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent"/><p className="absolute bottom-3 left-3 right-3 font-display text-[12px] font-semibold text-white sm:text-[13px]">{m.title||"Sahadan"}</p></Link>)}</div>
        </div>
        {secondaryMedia.length>2&&<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:gap-4">{secondaryMedia.slice(2,6).map(m=><Link href="/galeri" key={m.id} className="group relative aspect-video overflow-hidden rounded-lg border border-ink/15 bg-ink">{isVideo(m)?<video src={m.url} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-85"/>:<CmsImage src={m.url} alt={m.alt_text||m.title||"RECF Türkiye etkinlik fotoğrafı"} sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105"/>}<div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"/></Link>)}</div>}
      </div>
    </section>}

    <section className="border-t-2 border-ink bg-cyan-brand/10"><div className="safe-x mx-auto flex max-w-7xl flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-10"><div><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">GÖNÜLLÜ AĞI</p><h2 className="mt-2 font-display text-3xl font-bold">SAHAYI BİRLİKTE HAZIRLAYALIM.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/65">Etkinlik hazırlığı, eğitim, teknik destek ve iletişim süreçlerine katkı sunmak isteyen yetişkin gönüllüler ve Hakem ve Jüri Akademisi adayları için.</p></div><Link href="/gonullu" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold text-white shadow-plateSm shadow-cyan-brand">GÖNÜLLÜ AĞI’NA KATIL →</Link></div></section>

    {/* TAKIM PLAKASI CTA */}
    {enabled(settings,"home_show_cta")&&<section className="field-grid-dark relative overflow-hidden bg-ink">
      <div aria-hidden className="home-orbit home-orbit-red absolute -left-20 -top-20 h-40 w-40 rotate-45 bg-alliance-red sm:h-44 sm:w-44"/>
      <div aria-hidden className="home-orbit home-orbit-blue absolute -bottom-20 -right-20 h-40 w-40 rotate-45 bg-alliance-blue sm:h-44 sm:w-44"/>
      <div className="safe-x mx-auto grid max-w-7xl items-center gap-10 py-16 lg:grid-cols-2 lg:px-10 lg:py-24 2xl:gap-16 2xl:py-28">
        <div className="relative z-10"><span className="inline-flex items-center gap-2 rounded bg-cyan-brand px-3 py-1.5 font-display text-xs font-bold text-ink"><FigmaIcon name="plaka" className="h-4 w-4"/> TAKIM PLAKASI</span><h2 className="mt-4 font-display text-[36px] font-bold leading-[1.04] text-white sm:text-[44px] lg:text-[56px]">{settings.home_cta_title||"PLAKAN HAZIR. SAHAYA ÇIK."}</h2><p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/65 sm:text-[16px]">{settings.home_cta_description||"Takım başvurunu yap, resmî kaydını RECFEvents.org’da tamamla ve sezonun etkinliklerine hazırlan. Okul, kulüp veya bağımsız topluluk olarak RECF Türkiye yolculuğunu başlat."}</p><Link href="/kayit" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink shadow-plateSm shadow-white/20 transition-transform hover:-translate-y-0.5"><FigmaIcon name="kayit" className="h-5 w-5"/> {copy().apply}</Link></div>
        <Reveal className="relative z-10"><div className="home-plate mx-auto max-w-[480px] -rotate-[3deg] overflow-hidden rounded-2xl border-4 border-cyan-brand bg-white shadow-[14px_14px_0_rgba(41,185,229,.28)]"><div className="flex items-center justify-between gap-3 bg-ink px-4 py-3 sm:px-5"><span className="font-display text-xs font-bold text-cyan-brand sm:text-sm">TR · RECF TÜRKİYE</span><span className="font-display text-xs font-medium text-white/60 sm:text-xs">SEZON {season}</span></div><p className="break-all py-6 text-center font-display text-[clamp(3.2rem,16vw,6rem)] font-bold tracking-[3px] text-ink sm:tracking-[6px]">{settings.home_cta_plate||"123A"}</p><p className="px-4 pb-5 text-center font-display text-xs font-medium tracking-[1px] text-ink/65 sm:text-xs">SENİN TAKIMIN — İLK MAÇTAN ŞAMPİYONAYA</p></div></Reveal>
      </div>
    </section>}
  </>;
}
