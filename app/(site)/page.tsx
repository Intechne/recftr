"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchArray, fetchObject } from "@/lib/client-api";
import { FigmaIcon, type FigmaIconName } from "@/components/FigmaIcon";
import { CountUp, Reveal, RoutePath } from "@/components/Motion";

type Program = {
  slug:string; code:string; name:string; game?:string; age?:string; color_hex?:string;
  short?:string; cover_url?:string;
};
type Event = {
  id:number|string; slug:string; code?:string; title:string; cover_url?:string;
  date_label?:string; city?:string; venue?:string; capacity?:number; status?:string;
};
type News = {
  id:number|string; slug:string; tag?:string; title:string; excerpt?:string;
  cover_url?:string; date?:string;
};
type Media = {
  id:number|string; type?:string; url:string; alt_text?:string; title?:string; caption?:string;
};
type HomeStats = { teams:number; cities:number; events:number; students:number; programs:number };
type RouteStep = { month:string; label:string; done:boolean };
type Settings = {
  hero_title?:string; hero_accent_title?:string; hero_description?:string; hero_image?:string;
  season_label?:string; season_route_title?:string; season_route?:string;
  home_cta_title?:string; home_cta_description?:string; home_cta_plate?:string;
  home_show_programs?:string; home_show_route?:string; home_show_stats?:string;
  home_show_events?:string; home_show_news?:string; home_show_gallery?:string; home_show_cta?:string;
};

const DEFAULT_ROUTE:RouteStep[] = [
  {month:"EYL",label:"Kayıtlar",done:true},
  {month:"EKİ",label:"İl Etkinlikleri",done:true},
  {month:"ARA",label:"Bölge Turnuvaları",done:false},
  {month:"ŞUB",label:"Türkiye Şampiyonası",done:false},
  {month:"NİS",label:"Dünya Şampiyonası",done:false},
];
const EMPTY_STATS:HomeStats={teams:0,cities:0,events:0,students:0,programs:0};

function parseRoute(raw?:string):RouteStep[]{
  if(!raw) return DEFAULT_ROUTE;
  try{
    const data=JSON.parse(raw);
    if(!Array.isArray(data)) return DEFAULT_ROUTE;
    const rows=data.map((x:any)=>({month:String(x?.month||"").trim().slice(0,8),label:String(x?.label||"").trim().slice(0,80),done:!!x?.done})).filter((x:RouteStep)=>x.month&&x.label);
    return rows.length>=2?rows:DEFAULT_ROUTE;
  }catch{return DEFAULT_ROUTE;}
}
function enabled(settings:Settings,key:keyof Settings){ return settings[key] !== "false"; }
function programIcon(p:Program):FigmaIconName { return /ADC|PRO/i.test(p.code||"") ? "drone" : "robot"; }
function isVideo(m?:Media){ const t=String(m?.type||"").toLocaleLowerCase("tr-TR"); return !!m && ((t==="video"||t==="vıdeo") || /\.(mp4|webm|mov)(\?|$)/i.test(m.url||"")); }
function fmtDate(date?:string){ if(!date)return ""; try{return new Date(date).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}catch{return date} }

export default function Home() {
  const [programs,setPrograms]=useState<Program[]>([]);
  const [events,setEvents]=useState<Event[]>([]);
  const [news,setNews]=useState<News[]>([]);
  const [media,setMedia]=useState<Media[]>([]);
  const [settings,setSettings]=useState<Settings>({});
  const [stats,setStats]=useState<HomeStats>(EMPTY_STATS);

  useEffect(()=>{
    let active=true;
    void Promise.all([
      fetchArray<Program>("/api/programs"),
      fetchArray<Event>("/api/events"),
      fetchArray<News>("/api/news"),
      fetchArray<Media>("/api/media"),
      fetchObject<Settings>("/api/settings",{}),
      fetchObject<HomeStats>("/api/home-stats",EMPTY_STATS),
    ]).then(([programRows,eventRows,newsRows,mediaRows,publicSettings,publicStats])=>{
      if(!active)return;
      setPrograms(programRows); setEvents(eventRows); setNews(newsRows); setMedia(mediaRows);
      setSettings(publicSettings); setStats(publicStats);
    });
    return()=>{active=false};
  },[]);

  const route=useMemo(()=>parseRoute(settings.season_route),[settings.season_route]);
  const season=settings.season_label||"2026–27";
  const rawHero=(settings.hero_title||"MAÇ GÜNÜ HER GÜN.").trim();
  const inferredAccent=/HER GÜN\.?$/i.test(rawHero)?(rawHero.match(/HER GÜN\.?$/i)?.[0]||""):"";
  const heroAccent=(settings.hero_accent_title||inferredAccent||"HER GÜN.").trim();
  const heroMain=inferredAccent&&rawHero.toLowerCase().endsWith(inferredAccent.toLowerCase())?rawHero.slice(0,-inferredAccent.length).trim():rawHero;
  const featureMedia=media[0];
  const secondaryMedia=media.slice(1,7);
  const statItems=[
    {value:stats.teams,label:"KAYITLI TAKIM",suffix:"",icon:"plaka" as FigmaIconName},
    {value:stats.cities,label:"İL",suffix:"",icon:"konum" as FigmaIconName},
    {value:stats.events,label:"ETKİNLİK",suffix:"",icon:"takvim" as FigmaIconName},
    {value:stats.students,label:"ÖĞRENCİ",suffix:"",icon:"mentor" as FigmaIconName},
    {value:stats.programs,label:"RESMİ PROGRAM",suffix:"",icon:"kupa" as FigmaIconName},
  ];

  return <>
    {/* HERO — eski yayın tasarımının hareketli ritmi + CMS verisi */}
    <section className="field-grid relative overflow-hidden">
      <div aria-hidden className="home-orbit home-orbit-red absolute -left-16 bottom-5 h-28 w-28 rotate-45 bg-alliance-red/90 sm:-left-24 sm:h-40 sm:w-40"/>
      <div aria-hidden className="home-orbit home-orbit-blue absolute -right-16 -top-14 h-36 w-36 rotate-45 bg-alliance-blue/90 sm:-right-24 sm:-top-24 sm:h-56 sm:w-56"/>
      <div className="safe-x mx-auto grid max-w-7xl items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1.12fr_.88fr] lg:gap-12 lg:px-10 lg:py-24 2xl:gap-16 2xl:py-28">
        <div className="relative z-10">
          <span className="rise rise-1 inline-flex min-h-9 items-center gap-2 rounded bg-ink px-3.5 py-2 font-display text-[11px] font-semibold tracking-[1.5px] text-cyan-brand sm:text-[12px]">
            <FigmaIcon name="robot" className="h-4 w-4"/> RESMİ RECF TÜRKİYE PLATFORMU
          </span>
          <h1 className="mt-5 font-display font-bold leading-[.94] sm:mt-6">
            <span className="rise rise-2 block text-[clamp(2.9rem,14vw,5.2rem)] text-ink lg:text-[88px] 2xl:text-[102px]">{heroMain}</span>
            {heroAccent&&<span className="rise rise-3 block text-[clamp(2.9rem,14vw,5.2rem)] text-cyan-brand lg:text-[88px] 2xl:text-[102px]" style={{WebkitTextStroke:"clamp(1px,.16vw,2px) #10192F"}}>{heroAccent}</span>}
          </h1>
          <p className="rise rise-4 mt-5 max-w-xl text-[15px] leading-relaxed text-ink/60 sm:mt-6 sm:text-[17px] lg:text-[18px] 2xl:max-w-2xl 2xl:text-[19px]">{settings.hero_description||"Türkiye’nin robotik ve drone yarışma programları. Takım numaranı al, programını seç, sezon rotasına katıl."}</p>
          <div className="rise rise-4 mt-7 flex flex-col gap-3 min-[460px]:flex-row sm:mt-8">
            <Link href="/kayit" className="flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-[13px] font-bold text-white shadow-plateSm shadow-cyan-brand transition-transform hover:-translate-y-0.5"><FigmaIcon name="kayit" className="h-5 w-5"/> TAKIM NUMARANI AL</Link>
            <Link href="/programlar" className="flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-ink bg-white px-5 py-3 font-display text-[13px] font-bold transition-transform hover:-translate-y-0.5"><FigmaIcon name="kupa" className="h-5 w-5"/> PROGRAMLARI GÖR</Link>
          </div>
        </div>

        <Reveal className="relative z-10">
          <div className="overflow-hidden rounded-2xl border-2 border-ink bg-ink shadow-[0_24px_60px_rgba(6,12,26,.28)]">
            {settings.hero_image&&<div className="relative h-32 overflow-hidden border-b border-white/10 sm:h-40 2xl:h-48"><img src={settings.hero_image} alt="RECF Türkiye sezonu" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"/></div>}
            <div className="flex items-center justify-between bg-white/5 px-4 py-3.5 sm:px-5 sm:py-4">
              <span className="flex items-center gap-2 font-display text-[13px] font-bold text-cyan-brand sm:text-[15px]"><FigmaIcon name="kupa" className="h-5 w-5"/> SEZON OYUNLARI {season}</span>
              <span className="rounded-[3px] bg-cyan-brand px-2.5 py-1 font-display text-[10px] font-bold text-ink">CANLI</span>
            </div>
            <div className="px-2 py-2">
              {programs.slice(0,5).map(p=><Link key={p.slug} href={`/programlar/${p.slug}`} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5 sm:gap-3.5">
                <span className="flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md font-display text-sm font-bold text-white" style={{backgroundColor:p.color_hex||"#29B9E5"}}>{p.code}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-display text-[15px] font-bold text-white sm:text-[17px]">{p.game||p.name}</span><span className="block truncate text-[11px] text-white/50 sm:text-[12px]">{p.age||p.name}</span></span>
                <span className="text-cyan-brand transition-transform group-hover:translate-x-1">→</span>
              </Link>)}
              {programs.length===0&&<p className="px-3 py-6 text-sm text-white/45">Yayınlanmış program verisi bekleniyor.</p>}
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
          <p className="max-w-md text-[14px] leading-relaxed text-ink/50 md:text-right sm:text-[15px]">Program kartları CMS’teki canlı oyun, yaş grubu ve marka renklerinden oluşur.</p>
        </div>
        <div className="grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:gap-5">
          {programs.map((p,i)=><Reveal key={p.slug} delay={i*70} className="h-full"><Link href={`/programlar/${p.slug}`} className="plate-hover flex h-full flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plate" style={{["--tw-shadow-color" as string]:p.color_hex||"#29B9E5"}}>
            <div className="flex min-h-20 items-center justify-between p-4 text-white" style={{backgroundColor:p.color_hex||"#29B9E5"}}><span className="font-display text-[30px] font-bold">{p.code}</span><FigmaIcon name={programIcon(p)} className="h-9 w-9 opacity-90"/></div>
            <div className="flex flex-1 flex-col p-4"><p className="font-display text-[10px] font-medium tracking-[1.5px] text-ink/45">{p.age||"RECF PROGRAMI"}</p><h3 className="mt-1.5 font-display text-[19px] font-bold text-ink">{p.name}</h3><p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink/55">{p.game?`“${p.game}” — `:""}{p.short||"Program detaylarını ve sezon bilgisini incele."}</p><p className="mt-auto pt-4 font-display text-[12px] font-semibold text-ink">PROGRAMA GİR →</p></div>
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
          <div className="relative mt-1 h-28">
            {route.map((wp,i)=>{const left=route.length<=1?50:3+(i/(route.length-1))*94;return <div key={`${wp.month}-${i}`} className="absolute flex -translate-x-1/2 flex-col items-center text-center" style={{left:`${left}%`}}>
              <span className={`diamond h-5 w-5 rounded border-[2.5px] border-ink ${wp.done?"bg-cyan-brand":"bg-white"}`}/>
              <span className={`mt-2.5 font-display text-sm font-bold ${wp.done?"text-cyan-deep":"text-ink"}`}>{wp.month}</span>
              <span className="max-w-[150px] text-[12px] text-ink/55 xl:text-[13px]">{wp.label}</span>
            </div>})}
          </div>
        </div>
        <ol className="mt-8 space-y-5 border-l-2 border-dashed border-ink/30 pl-6 lg:hidden">
          {route.map((wp,i)=><li key={`${wp.month}-${i}`} className="relative flex gap-3"><span className={`diamond absolute -left-[33px] top-1 h-4 w-4 rounded border-2 border-ink ${wp.done?"bg-cyan-brand":"bg-white"}`}/><span className="min-w-10 font-display text-sm font-bold text-ink">{wp.month}</span><span className="text-[14px] text-ink/60">{wp.label}</span></li>)}
        </ol>
      </div>
    </section>}

    {/* CANLI İSTATİSTİK BANDI */}
    {enabled(settings,"home_show_stats")&&<section className="bg-ink">
      <div className="safe-x mx-auto grid max-w-7xl grid-cols-2 gap-y-9 py-10 sm:grid-cols-3 lg:grid-cols-5 lg:px-10 lg:py-12 2xl:py-14">
        {statItems.map((s,i)=><Reveal key={s.label} delay={i*60}><div className="relative text-center lg:border-r lg:border-white/10 lg:last:border-r-0"><FigmaIcon name={s.icon} className="mx-auto mb-2 h-6 w-6 text-white/45"/><p className="font-display text-[34px] font-bold text-cyan-brand sm:text-[38px] lg:text-[46px] 2xl:text-[52px]"><CountUp to={s.value} suffix={s.suffix}/></p><p className="mt-1 font-display text-[10px] font-medium tracking-[1.7px] text-white/55 sm:text-[11px]">{s.label}</p></div></Reveal>)}
      </div>
    </section>}

    {/* YAKLAŞAN ETKİNLİKLER — masaüstünde skorboard/tablo, mobilde kart satırı */}
    {enabled(settings,"home_show_events")&&<section className="bg-white">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-[11px] font-bold tracking-[2px] text-cyan-deep">SAHA TAKVİMİ</p><h2 className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">YAKLAŞAN ETKİNLİKLER</h2></div><Link href="/etkinlikler" className="flex items-center gap-2 font-display text-[12px] font-bold text-cyan-deep"><FigmaIcon name="takvim" className="h-5 w-5"/> TÜM ETKİNLİKLER →</Link></div>
        <div className="mt-7 overflow-hidden rounded-xl border-2 border-ink">
          <div className="hidden bg-ink px-5 py-3.5 font-display text-[11px] font-semibold tracking-[1.3px] text-white/50 lg:grid lg:grid-cols-[110px_90px_1fr_240px_140px]"><span>TARİH</span><span>PROGRAM</span><span>ETKİNLİK</span><span>KONUM</span><span>DURUM</span></div>
          {events.slice(0,6).map((e,i)=><Reveal key={e.id} delay={i*55}><Link href={`/etkinlikler/${e.slug}`} className={`group grid gap-3 px-4 py-4 transition-colors hover:bg-cyan-brand/5 sm:px-5 lg:grid-cols-[110px_90px_1fr_240px_140px] lg:items-center ${i%2?"bg-paper/60":"bg-white"}`}>
            <span className="font-display text-[15px] font-bold text-ink">{e.date_label||"Tarih yakında"}</span>
            <span><span className="inline-flex min-w-14 items-center justify-center rounded bg-cyan-brand px-2 py-1 font-display text-[10px] font-bold text-ink">{e.code||"RECF"}</span></span>
            <span><span className="block font-semibold text-ink">{e.title}</span><span className="mt-0.5 block text-[11px] text-ink/40 lg:hidden">ETKİNLİK</span></span>
            <span className="flex items-center gap-2 text-[13px] text-ink/60"><FigmaIcon name="konum" className="h-4 w-4 shrink-0"/>{[e.city,e.venue].filter(Boolean).join(" · ")||"Konum yakında"}</span>
            <span className="flex items-center gap-2 font-display text-[11px] font-bold text-cyan-deep"><span className="pulse-soft h-2 w-2 rounded-full bg-cyan-brand"/>{e.status||"YAYINDA"}</span>
          </Link></Reveal>)}
          {events.length===0&&<p className="p-7 text-sm text-ink/45">Yayınlanmış etkinlik henüz yok.</p>}
        </div>
      </div>
    </section>}

    {/* HABERLER */}
    {enabled(settings,"home_show_news")&&news.length>0&&<section className="bg-paper">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-[11px] font-bold tracking-[2px] text-cyan-deep">HABER MERKEZİ</p><h2 className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">DUYURULAR & HABERLER</h2></div><Link href="/duyurular" className="flex items-center gap-2 font-display text-[12px] font-bold text-cyan-deep"><FigmaIcon name="anons" className="h-5 w-5"/> TÜM HABERLER →</Link></div>
        <div className="mt-7 grid gap-4 md:grid-cols-3 2xl:gap-5">{news.slice(0,3).map((n,i)=><Reveal key={n.slug} delay={i*80} className="h-full"><Link href={`/duyurular/${n.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink/20 bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="relative h-40 overflow-hidden bg-ink">{n.cover_url?<img src={n.cover_url} alt={n.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>:<div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2e4780] to-ink"><FigmaIcon name="anons" className="h-14 w-14 text-cyan-brand"/></div>}<span className="absolute left-3 top-3 rounded bg-cyan-brand px-2 py-1 font-display text-[10px] font-bold text-ink">{n.tag||"DUYURU"}</span></div>
          <div className="flex flex-1 flex-col p-5"><h3 className="font-semibold leading-snug text-ink">{n.title}</h3><p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink/55">{n.excerpt}</p><p className="mt-auto pt-4 font-display text-[10px] font-medium tracking-[1px] text-ink/40">{fmtDate(n.date).toUpperCase()}</p></div>
        </Link></Reveal>)}</div>
      </div>
    </section>}

    {/* SAHADAN — hareketli medya kompozisyonu */}
    {enabled(settings,"home_show_gallery")&&media.length>0&&<section className="bg-white">
      <div className="safe-x mx-auto max-w-7xl py-14 sm:py-16 lg:px-10 lg:py-20 2xl:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-[11px] font-bold tracking-[2px] text-cyan-deep">SAHADAN</p><h2 className="mt-1 font-display text-[28px] font-bold sm:text-[34px] lg:text-[40px]">ETKİNLİK GALERİSİ</h2></div><Link href="/galeri" className="flex items-center gap-2 font-display text-[12px] font-bold text-cyan-deep"><FigmaIcon name="yayin" className="h-5 w-5"/> TÜM GALERİ →</Link></div>
        <div className="mt-7 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
          {featureMedia&&<Link href="/galeri" className="group relative min-h-[260px] overflow-hidden rounded-xl border-2 border-ink bg-ink sm:min-h-[340px] lg:min-h-[410px]">
            {isVideo(featureMedia)?<video src={featureMedia.url} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-85"/>:<img src={featureMedia.url} alt={featureMedia.alt_text||featureMedia.title||"RECF Türkiye"} className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"/>}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent"/><div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3"><div><span className="inline-flex items-center gap-2 rounded bg-ink/85 px-3 py-1.5 font-display text-[11px] font-semibold text-white"><FigmaIcon name="yayin" className="h-4 w-4 text-cyan-brand"/> ÖNE ÇIKAN MEDYA</span><p className="mt-2 max-w-xl font-display text-[17px] font-bold text-white sm:text-[20px]">{featureMedia.title||"RECF Türkiye sahadan"}</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-brand text-ink transition-transform group-hover:scale-110"><FigmaIcon name="rota" className="h-6 w-6"/></span></div>
          </Link>}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">{secondaryMedia.slice(0,2).map(m=><Link href="/galeri" key={m.id} className="group relative min-h-36 overflow-hidden rounded-xl border-2 border-ink bg-ink sm:min-h-44 lg:min-h-0">{isVideo(m)?<video src={m.url} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-85"/>:<img src={m.url} alt={m.alt_text||m.title||"RECF Türkiye"} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>}<div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent"/><p className="absolute bottom-3 left-3 right-3 font-display text-[12px] font-semibold text-white sm:text-[13px]">{m.title||"Sahadan"}</p></Link>)}</div>
        </div>
        {secondaryMedia.length>2&&<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:gap-4">{secondaryMedia.slice(2,6).map(m=><Link href="/galeri" key={m.id} className="group relative aspect-video overflow-hidden rounded-lg border border-ink/15 bg-ink">{isVideo(m)?<video src={m.url} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-85"/>:<img src={m.url} alt={m.alt_text||m.title||"RECF Türkiye"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>}<div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"/></Link>)}</div>}
      </div>
    </section>}

    {/* TAKIM PLAKASI CTA */}
    {enabled(settings,"home_show_cta")&&<section className="field-grid-dark relative overflow-hidden bg-ink">
      <div aria-hidden className="home-orbit home-orbit-red absolute -left-20 -top-20 h-40 w-40 rotate-45 bg-alliance-red sm:h-44 sm:w-44"/>
      <div aria-hidden className="home-orbit home-orbit-blue absolute -bottom-20 -right-20 h-40 w-40 rotate-45 bg-alliance-blue sm:h-44 sm:w-44"/>
      <div className="safe-x mx-auto grid max-w-7xl items-center gap-10 py-16 lg:grid-cols-2 lg:px-10 lg:py-24 2xl:gap-16 2xl:py-28">
        <div className="relative z-10"><span className="inline-flex items-center gap-2 rounded bg-cyan-brand px-3 py-1.5 font-display text-[10px] font-bold text-ink"><FigmaIcon name="plaka" className="h-4 w-4"/> TAKIM PLAKASI</span><h2 className="mt-4 font-display text-[36px] font-bold leading-[1.04] text-white sm:text-[44px] lg:text-[56px]">{settings.home_cta_title||"PLAKAN HAZIR. SAHAYA ÇIK."}</h2><p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/65 sm:text-[16px]">{settings.home_cta_description||"Takım numaranı al, sezonun ilk etkinliğine kaydol. Okul, kulüp veya bağımsız topluluk olarak RECF Türkiye yolculuğunu başlat."}</p><Link href="/kayit" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-cyan-brand px-5 py-3 font-display text-[13px] font-bold text-ink shadow-plateSm shadow-white/20 transition-transform hover:-translate-y-0.5"><FigmaIcon name="kayit" className="h-5 w-5"/> TAKIM KAYDINA BAŞLA</Link></div>
        <Reveal className="relative z-10"><div className="home-plate mx-auto max-w-[480px] -rotate-[3deg] overflow-hidden rounded-2xl border-4 border-cyan-brand bg-white shadow-[14px_14px_0_rgba(41,185,229,.28)]"><div className="flex items-center justify-between gap-3 bg-ink px-4 py-3 sm:px-5"><span className="font-display text-[11px] font-bold text-cyan-brand sm:text-sm">TR · RECF TÜRKİYE</span><span className="font-display text-[10px] font-medium text-white/60 sm:text-xs">SEZON {season}</span></div><p className="break-all py-6 text-center font-display text-[clamp(3.2rem,16vw,6rem)] font-bold tracking-[3px] text-ink sm:tracking-[6px]">{settings.home_cta_plate||"123A"}</p><p className="px-4 pb-5 text-center font-display text-[9px] font-medium tracking-[1px] text-ink/45 sm:text-[10.5px]">SENİN TAKIMIN — İLK MAÇTAN ŞAMPİYONAYA</p></div></Reveal>
      </div>
    </section>}
  </>;
}
