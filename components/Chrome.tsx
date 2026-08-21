"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {FigmaIcon} from "@/components/FigmaIcon";

type PublicSettings={site_name?:string;ticker?:string;instagram?:string;youtube?:string;linkedin?:string;site_logo?:string;site_mark?:string;favicon_url?:string;apple_touch_icon_url?:string;og_image?:string};
const fallbackTicker=["RECF Türkiye 2026–2027 sezonu başladı","Takım kayıtları açık","Etkinlik takvimini incele"];
async function getPublicSettings():Promise<PublicSettings>{try{const response=await fetch("/api/settings",{cache:"no-store"});if(!response.ok)return{};return(await response.json())as PublicSettings}catch{return{}}}

function Brand({settings,size="nav"}:{settings:PublicSettings;size?:"nav"|"footer"}){
  if(settings.site_logo)return <img src={settings.site_logo} alt={settings.site_name||"RECF Türkiye"} className={size==="nav"?"h-9 max-w-[170px] object-contain sm:h-11 sm:max-w-[240px] 2xl:h-12 2xl:max-w-[280px]":"h-10 max-w-[210px] object-contain sm:h-[50px] sm:max-w-[270px] 2xl:h-14 2xl:max-w-[320px]"}/>;
  return <span className="flex min-w-0 items-center gap-2 sm:gap-2.5">{settings.site_mark?<img src={settings.site_mark} alt="" className={size==="nav"?"h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8":"h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"}/>:<FigmaIcon name="robot" className={size==="nav"?"h-6 w-6 shrink-0 text-cyan-deep sm:h-7 sm:w-7":"h-7 w-7 shrink-0 text-cyan-deep sm:h-8 sm:w-8"}/>}<span className={size==="nav"?"truncate font-display text-[16px] font-bold tracking-wide text-ink sm:text-[19px]":"font-display text-[19px] font-bold text-ink sm:text-[22px]"}>{settings.site_name||"RECF TÜRKİYE"}</span></span>;
}

export function Ticker(){
  const[items,setItems]=useState<string[]>(fallbackTicker);
  useEffect(()=>{void getPublicSettings().then(settings=>{if(!settings.ticker)return;try{const tickerItems:unknown=JSON.parse(settings.ticker);if(Array.isArray(tickerItems)&&tickerItems.length>0&&tickerItems.every(item=>typeof item==="string"))setItems(tickerItems)}catch{}})},[]);
  const row=<div className="flex items-center gap-6 pr-6 sm:gap-9 sm:pr-9">{items.map((message,index)=><span key={`${message}-${index}`} className="flex items-center gap-6 whitespace-nowrap sm:gap-9"><span className="font-display text-[11px] font-medium text-white sm:text-[12.5px] 2xl:text-[13px]">{message}</span><span className="text-cyan-brand">•</span></span>)}</div>;
  return <div className="safe-x flex min-h-9 items-center gap-3 overflow-hidden bg-ink py-2 sm:gap-6 sm:py-[9px]"><span className="z-10 flex shrink-0 items-center gap-1.5 rounded-[3px] bg-cyan-brand px-2 py-[3px] font-display text-[10px] font-bold tracking-wider text-ink sm:gap-2 sm:px-2.5 sm:text-[11px]"><FigmaIcon name="anons" className="h-3.5 w-3.5"/><span className="hidden min-[390px]:inline">DUYURU</span></span><div className="relative min-w-0 flex-1 overflow-hidden"><div className="marquee-track flex w-max">{row}{row}</div></div></div>;
}

const links=[{href:"/programlar",label:"Programlar"},{href:"/etkinlikler",label:"Etkinlikler"},{href:"/duyurular",label:"Duyurular"},{href:"/dokumanlar",label:"Dokümanlar"},{href:"/takimlar",label:"Takımlar"},{href:"/galeri",label:"Galeri"},{href:"/hakkimizda",label:"Hakkımızda"}];

export function Nav(){
  const path=usePathname();const[open,setOpen]=useState(false);const[settings,setSettings]=useState<PublicSettings>({});
  useEffect(()=>{void getPublicSettings().then(setSettings)},[]);
  useEffect(()=>{setOpen(false)},[path]);
  return <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/95 backdrop-blur-md">
    <nav className="safe-x mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 py-2.5 sm:min-h-[72px] sm:py-3.5 lg:px-10 2xl:min-h-[80px]">
      <Link href="/" className="min-w-0 flex-1 xl:flex-none"><Brand settings={settings}/></Link>
      <div className="hidden items-center gap-4 xl:flex 2xl:gap-6">{links.map(link=><Link key={link.href} href={link.href} className={`rounded px-1 py-2 text-[13px] font-semibold 2xl:text-[15px] ${path.startsWith(link.href)?"text-cyan-deep":"text-ink hover:text-cyan-deep"}`}>{link.label}</Link>)}</div>
      <div className="hidden items-center gap-2 xl:flex"><Link href="/giris" className="rounded-md border-2 border-ink px-3 py-2.5 font-display text-xs font-bold 2xl:px-4 2xl:text-[13px]">TAKIM PORTALI</Link><Link href="/kayit" className="rounded-md border-2 border-ink bg-ink px-4 py-2.5 font-display text-xs font-bold text-white shadow-plateSm shadow-cyan-brand 2xl:px-5 2xl:text-[13px]">TAKIM KAYDI</Link></div>
      <button type="button" onClick={()=>setOpen(v=>!v)} className="shrink-0 rounded-md border-2 border-ink px-3 py-2 font-display text-xs font-bold sm:text-sm xl:hidden" aria-expanded={open} aria-controls="mobile-navigation" aria-label="Menüyü aç veya kapat"><span className="sm:hidden">{open?"KAPAT":"MENÜ"}</span><span className="hidden sm:inline">{open?"MENÜYÜ KAPAT":"MENÜ"}</span></button>
    </nav>
    {open&&<div id="mobile-navigation" className="safe-x max-h-[calc(100vh-100px)] max-h-[calc(100dvh-100px)] overflow-y-auto border-t border-ink/10 bg-white safe-bottom xl:hidden"><div className="mx-auto max-w-7xl py-2">{links.map(link=><Link key={link.href} href={link.href} className={`flex min-h-12 items-center justify-between border-b border-ink/5 py-3 font-display text-sm font-semibold sm:text-[15px] ${path.startsWith(link.href)?"text-cyan-deep":"text-ink"}`}><span>{link.label}</span><span aria-hidden="true">→</span></Link>)}<div className="mt-4 grid gap-2 sm:grid-cols-2"><Link href="/giris" className="flex min-h-12 items-center justify-center rounded-md border-2 border-ink px-3 py-3 font-display text-xs font-bold">TAKIM PORTALI</Link><Link href="/kayit" className="flex min-h-12 items-center justify-center rounded-md bg-ink px-3 py-3 font-display text-xs font-bold text-white">TAKIM KAYDI</Link></div></div></div>}
  </header>;
}

const footCols=[{title:"PROGRAMLAR",links:[["Engage","/programlar/engage"],["Achieve","/programlar/achieve"],["Inspire","/programlar/inspire"],["Aerial Drone Competition","/programlar/adc"],["ADC Pro","/programlar/adc-pro"]]},{title:"KATILIM",links:[["Etkinlik Takvimi","/etkinlikler"],["Takımlar","/takimlar"],["Takım Kaydı","/kayit"],["Takım Portalı","/giris"],["Dokümanlar","/dokumanlar"]]},{title:"KURUMSAL",links:[["Hakkımızda","/hakkimizda"],["Ekibimiz","/hakkimizda#ekibimiz"],["Duyurular","/duyurular"],["Galeri","/galeri"],["İletişim","/hakkimizda#iletisim"]]}] satisfies Array<{title:string;links:Array<[string,string]>}>;

export function Footer(){
  const[settings,setSettings]=useState<PublicSettings>({});useEffect(()=>{void getPublicSettings().then(setSettings)},[]);const socialLinks=[["Instagram",settings.instagram],["YouTube",settings.youtube],["LinkedIn",settings.linkedin]].filter((item):item is[string,string]=>Boolean(item[1]));
  return <footer className="border-t-4 border-ink bg-white"><div className="safe-x mx-auto grid max-w-7xl gap-9 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10 lg:py-14 2xl:gap-14"><div className="sm:col-span-2 lg:col-span-1"><Brand settings={settings} size="footer"/><p className="mt-3.5 max-w-sm text-[13px] leading-relaxed text-ink/60 2xl:text-[15px]">RECF programlarının Türkiye operasyonları, takım ve etkinlik süreçleri.</p><div className="mt-4 flex flex-wrap gap-3">{socialLinks.map(([label,url])=><a key={label} href={url} target="_blank" rel="noreferrer" className="font-display text-[11px] font-bold tracking-wide text-cyan-deep hover:underline 2xl:text-xs">{label.toUpperCase()}</a>)}</div></div>{footCols.map(column=><div key={column.title}><h3 className="font-display text-[13px] font-bold tracking-[2px] text-ink 2xl:text-sm">{column.title}</h3><ul className="mt-4 space-y-2.5 sm:space-y-3">{column.links.map(([label,href])=><li key={label}><Link href={href} className="inline-flex min-h-8 items-center text-[14px] text-ink/60 hover:text-cyan-deep 2xl:text-[15px]">{label}</Link></li>)}</ul></div>)}</div><div className="safe-x mx-auto flex max-w-7xl flex-col gap-4 border-t border-ink/10 py-5 text-[12px] text-ink/50 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:px-10 2xl:text-[13px]"><p>© 2026 RECF Türkiye | Intechne Teknoloji</p><div className="flex flex-wrap gap-4"><Link href="/kvkk" className="hover:text-cyan-deep">KVKK</Link><Link href="/gizlilik" className="hover:text-cyan-deep">Gizlilik</Link><Link href="/cms-giris" className="opacity-40 hover:opacity-100">Yönetim</Link></div><p className="flex items-center gap-1.5 font-display font-medium tracking-wide">MAÇ GÜNÜ. HER GÜN. <FigmaIcon name="robot" className="h-4 w-4"/></p></div></footer>;
}
