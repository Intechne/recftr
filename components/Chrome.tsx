"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {FigmaIcon, type FigmaIconName} from "@/components/FigmaIcon";
import { FALLBACK_TICKER } from "@/lib/public-announcements";
import NewsletterForm from "@/components/public/NewsletterForm";
import { alternatePath, isEnglishPath } from "@/lib/i18n";
import { REPRESENTATION_LINE } from "@/lib/site-config";
import { trPhone } from "@/lib/phone";
import { copy, COPY } from "@/lib/copy";

export type PublicSettings={contact_phone?:string;site_name?:string;ticker?:string;instagram?:string;youtube?:string;linkedin?:string;contact_info?:string;site_logo?:string;site_mark?:string;favicon_url?:string;apple_touch_icon_url?:string;og_image?:string;recf_representation_approved?:string};
/** Layout'un sunucuda hesapladığı görünürlük bayrakları. */
export type ChromeFlags={launchPublished?:boolean};

function Brand({settings,size="nav"}:{settings:PublicSettings;size?:"nav"|"footer"}){
  if(settings.site_logo)return <img src={settings.site_logo} alt={settings.site_name||"RECF Türkiye"} className={size==="nav"?"block h-9 max-h-11 w-auto max-w-[170px] object-contain sm:h-11 sm:max-w-[240px] 2xl:h-12 2xl:max-w-[280px]":"block h-10 max-h-14 w-auto max-w-[210px] object-contain sm:h-[50px] sm:max-w-[270px] 2xl:h-14 2xl:max-w-[320px]"}/>;
  return <span className="flex min-w-0 items-center gap-2 sm:gap-2.5">{settings.site_mark?<img src={settings.site_mark} alt="" className={size==="nav"?"block h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8":"block h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"}/>:<FigmaIcon name="robot" className={size==="nav"?"h-6 w-6 shrink-0 text-cyan-deep sm:h-7 sm:w-7":"h-7 w-7 shrink-0 text-cyan-deep sm:h-8 sm:w-8"}/>}<span className={size==="nav"?"truncate font-display text-[16px] font-bold tracking-wide text-ink sm:text-[19px]":"font-display text-[19px] font-bold text-ink sm:text-[22px]"}>{settings.site_name||"RECF TÜRKİYE"}</span></span>;
}

function tickerItems(raw?:string){
  if(!raw)return FALLBACK_TICKER;
  try{const x:unknown=JSON.parse(raw);if(Array.isArray(x)&&x.length&&x.every(v=>typeof v==="string"))return x as string[]}catch{}
  return FALLBACK_TICKER;
}

export function Ticker({settings}:{settings:PublicSettings}){
  const path=usePathname();
  const items=tickerItems(settings.ticker);
  const viewport=useRef<HTMLDivElement>(null);
  const firstRow=useRef<HTMLDivElement>(null);
  const [copies,setCopies]=useState(1);
  useEffect(()=>{
    const container=viewport.current, row=firstRow.current;
    if(!container||!row)return;
    const measure=()=>{
      const width=row.getBoundingClientRect().width;
      if(width>0)setCopies(Math.max(1,Math.ceil(container.clientWidth/width)));
    };
    const observer=new ResizeObserver(measure);
    observer.observe(container);observer.observe(row);measure();
    return ()=>observer.disconnect();
  },[settings.ticker]);
  const row=(duplicate:boolean,copy:number)=><div ref={!duplicate&&copy===0?firstRow:undefined} aria-hidden={duplicate||copy>0||undefined} key={copy} className="flex shrink-0 items-center gap-6 pr-6 sm:gap-9 sm:pr-9">{items.map((message,index)=><span key={`${message}-${index}`} className="flex shrink-0 items-center gap-6 whitespace-nowrap sm:gap-9"><span className="font-display text-[11px] font-medium text-white sm:text-[12.5px] 2xl:text-[13px]">{message}</span><span className="text-cyan-brand">•</span></span>)}</div>;
  if(isEnglishPath(path))return null;
  return <div className="safe-x flex min-h-9 items-center gap-3 overflow-hidden bg-ink py-2 sm:gap-6 sm:py-[9px]"><span className="z-10 flex shrink-0 items-center gap-1.5 rounded-[3px] bg-cyan-brand px-2 py-[3px] font-display text-[10px] font-bold tracking-wider text-ink sm:gap-2 sm:px-2.5 sm:text-[11px]"><FigmaIcon name="news" className="h-3.5 w-3.5"/><span className="hidden min-[390px]:inline">DUYURU</span></span><div ref={viewport} className="relative min-w-0 flex-1 overflow-hidden"><div className="marquee-track flex w-max">{[false,true].map(duplicate=><div key={String(duplicate)} aria-hidden={duplicate||undefined} className="flex shrink-0">{Array.from({length:copies},(_,copy)=>row(duplicate,copy))}</div>)}</div></div></div>;
}

type NavLink={href:string;label:string;icon:FigmaIconName};
const primary:NavLink[]=[{href:"/programlar",label:"Programlar",icon:"programs"},{href:"/etkinlikler",label:"Etkinlikler",icon:"events"},{href:"/okullar",label:"Okullar",icon:"ittifak"},{href:"/veliler",label:"Veliler",icon:"users"},{href:"/takimlar",label:"Takımlar",icon:"teams"},{href:"/sss",label:"SSS",icon:"documents"}];
const more=(flags:ChromeFlags):NavLink[]=>[{href:"/duyurular",label:"Duyurular",icon:"news"},{href:"/dokumanlar",label:"Dokümanlar",icon:"documents"},{href:"/galeri",label:"Galeri",icon:"gallery"},{href:"/hakkimizda",label:"Hakkımızda",icon:"about"},{href:"/is-birlikleri",label:"İş Birlikleri",icon:"ittifak"},{href:"/planlama-komitesi",label:"Planlama Komitesi",icon:"users"},{href:"/gonullu",label:"Gönüllü Ağı",icon:"users"},...(flags.launchPublished?[{href:"/lansman",label:"Lansman",icon:"events" as FigmaIconName}]:[])];
const english:NavLink[]=[{href:"/en",label:"Home",icon:"home"},{href:"/en/about",label:"About",icon:"about"},{href:"/en/faq",label:"FAQ",icon:"documents"},{href:"/en/programs",label:"Programs",icon:"programs"}];

function active(path:string,href:string){return href==="/en"?path==="/en":path===href||path.startsWith(`${href}/`);}

function LanguageSwitch({path,className=""}:{path:string;className?:string}){
  const en=isEnglishPath(path);
  return <Link href={alternatePath(path)} hrefLang={en?"tr":"en"} lang={en?"tr":"en"} className={`inline-flex min-h-11 items-center justify-center rounded-md border-2 border-ink/15 px-2.5 font-display text-xs font-bold text-ink hover:border-ink ${className}`} aria-label={en?"Türkçe sürüme geç":"Switch to English"}>{en?"TR":"EN"}</Link>;
}

export function Nav({settings,flags={}}:{settings:PublicSettings;flags?:ChromeFlags}){
  const path=usePathname();const[open,setOpen]=useState(false);
  useEffect(()=>{setOpen(false)},[path]);
  const en=isEnglishPath(path);
  const desktop=en?english:primary, extra=en?[]:more(flags);
  const apply=copy(en?"en":"tr").apply;
  return <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/95 backdrop-blur-md">
    <nav aria-label={en?"Main navigation":"Ana menü"} className="safe-x mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 py-2.5 sm:min-h-[72px] sm:py-3.5 lg:px-10 2xl:min-h-[80px]">
      <Link href={en?"/en":"/"} className="min-w-0 flex-1 xl:flex-none" aria-label={en?"RECF Türkiye home":"RECF Türkiye ana sayfa"}><Brand settings={settings}/></Link>
      <div className="hidden items-center gap-4 xl:flex 2xl:gap-6">{desktop.map(link=><Link key={link.href} href={link.href} aria-current={active(path,link.href)?"page":undefined} className={`rounded px-1 py-2 text-[13px] font-semibold 2xl:text-[15px] ${active(path,link.href)?"text-cyan-deep":"text-ink hover:text-cyan-deep"}`}>{link.label}</Link>)}{extra.length>0&&<details key={path} className="relative"><summary className={`cursor-pointer list-none rounded px-1 py-2 text-[13px] font-semibold 2xl:text-[15px] ${extra.some(link=>active(path,link.href))?"text-cyan-deep":"text-ink"}`}>Daha Fazla <span aria-hidden="true">⌄</span></summary><div className="absolute right-0 top-full mt-2 w-60 rounded-lg border-2 border-ink bg-white p-2 shadow-plateSm shadow-cyan-brand">{extra.map(link=><Link key={link.href} href={link.href} aria-current={active(path,link.href)?"page":undefined} className="flex items-center gap-2.5 rounded px-3 py-3 text-sm font-semibold hover:bg-paper"><FigmaIcon name={link.icon} className="h-4 w-4 shrink-0"/>{link.label}</Link>)}</div></details>}</div>
      <div className="hidden items-center gap-2 xl:flex"><LanguageSwitch path={path}/><Link href="/kayit" className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-ink px-4 py-2.5 font-display text-xs font-bold text-white shadow-plateSm shadow-cyan-brand 2xl:px-5 2xl:text-[13px]"><FigmaIcon name="applications" className="h-4 w-4"/>{apply}</Link></div>
      <div className="flex shrink-0 items-center gap-2 xl:hidden"><LanguageSwitch path={path}/><button type="button" onClick={()=>setOpen(v=>!v)} className="shrink-0 rounded-md border-2 border-ink px-3 py-2 font-display text-xs font-bold sm:text-sm" aria-expanded={open} aria-controls="mobile-navigation" aria-label={en?"Open or close menu":"Menüyü aç veya kapat"}><span className="sm:hidden">{open?(en?"CLOSE":"KAPAT"):(en?"MENU":"MENÜ")}</span><span className="hidden sm:inline">{open?(en?"CLOSE MENU":"MENÜYÜ KAPAT"):(en?"MENU":"MENÜ")}</span></button></div>
    </nav>
    {open&&<div id="mobile-navigation" className="safe-x max-h-[calc(100vh-100px)] max-h-[calc(100dvh-100px)] overflow-y-auto border-t border-ink/10 bg-white safe-bottom xl:hidden"><div className="mx-auto max-w-7xl py-2">{[...desktop,...extra].map(link=><Link key={link.href} href={link.href} aria-current={active(path,link.href)?"page":undefined} className={`flex min-h-12 items-center justify-between border-b border-ink/5 py-3 font-display text-sm font-semibold sm:text-[15px] ${active(path,link.href)?"text-cyan-deep":"text-ink"}`}><span className="flex items-center gap-2.5"><FigmaIcon name={link.icon} className="h-[18px] w-[18px] shrink-0"/>{link.label}</span><span aria-hidden="true">→</span></Link>)}<div className="mt-4 grid gap-2 sm:grid-cols-2"><Link href="/kayit" className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-3 py-3 font-display text-xs font-bold text-white"><FigmaIcon name="applications" className="h-4 w-4"/> {apply}</Link></div></div></div>}
  </header>;
}

const footCols=(flags:ChromeFlags)=>[{title:"PROGRAMLAR",links:[["Engage","/programlar/engage"],["Achieve","/programlar/achieve"],["Inspire","/programlar/inspire"],["Aerial Drone Competition","/programlar/adc"],["ADC Pro","/programlar/adc-pro"]]},{title:"KATILIM",links:[[COPY.tr.apply.charAt(0)+COPY.tr.apply.slice(1).toLocaleLowerCase("tr-TR"),"/kayit"],["Takım Kaydı Rehberi","/rehber/takim-kaydi"],["Etkinlik Takvimi","/etkinlikler"],["Takımlar","/takimlar"],["Okullar İçin","/okullar"],["Veliler İçin","/veliler"],["Sık Sorulan Sorular","/sss"],["Dokümanlar","/dokumanlar"],[COPY.tr.portal,"/giris"]]},{title:"KURUMSAL",links:[["Hakkımızda","/hakkimizda"],["İş Birlikleri","/is-birlikleri"],...(flags.launchPublished?[["Lansman","/lansman"]]:[]),["Planlama Komitesi","/planlama-komitesi"],["Gönüllü Ağı","/gonullu"],["Duyurular","/duyurular"],["Galeri","/galeri"],["İletişim","/hakkimizda#iletisim"],["English","/en"]]}] as Array<{title:string;links:Array<[string,string]>}>;
const englishCols=[{title:"RECF TÜRKİYE",links:[["Home","/en"],["Programs","/en/programs"],["About","/en/about"],["FAQ","/en/faq"]]},{title:"IN TURKISH",links:[["Programlar","/programlar"],["Etkinlikler","/etkinlikler"],[COPY.tr.apply.charAt(0)+COPY.tr.apply.slice(1).toLocaleLowerCase("tr-TR"),"/kayit"],["Türkçe ana sayfa","/"]]}] as Array<{title:string;links:Array<[string,string]>}>;


export function Footer({settings,flags={}}:{settings:PublicSettings;flags?:ChromeFlags}){
  const path=usePathname();const en=isEnglishPath(path);
  const socialLinks=[["Instagram",settings.instagram],["YouTube",settings.youtube],["LinkedIn",settings.linkedin]].filter((item):item is[string,string]=>Boolean(item[1]&&/^https:\/\//.test(item[1])));
  const email=String(settings.contact_info||"").trim();
  const phone=trPhone(settings.contact_phone);
  const columns=en?englishCols:footCols(flags);
  const representation=settings.recf_representation_approved==="true";
  return <footer className="border-t-4 border-ink bg-white"><div className={`safe-x mx-auto grid max-w-7xl gap-9 py-10 sm:grid-cols-2 sm:py-12 lg:px-10 lg:py-14 2xl:gap-14 ${en?"lg:grid-cols-[1.4fr_1fr_1fr]":"lg:grid-cols-[1.4fr_1fr_1fr_1fr]"}`}><div className="min-w-0 sm:col-span-2 lg:col-span-1"><Brand settings={settings} size="footer"/><p className="mt-3.5 max-w-sm text-[13px] leading-relaxed text-ink/65 2xl:text-[15px]">{en?"RECF programs in Türkiye — teams, events and the season pathway.":"RECF programlarının Türkiye operasyonları, takım ve etkinlik süreçleri."}</p>{representation&&<p className="mt-3 inline-flex rounded bg-ink px-2.5 py-1.5 font-display text-[10.5px] font-bold tracking-[1px] text-cyan-brand">{REPRESENTATION_LINE.toUpperCase()}</p>}{email&&<a href={`mailto:${email}`} className="mt-4 block break-all font-semibold text-ink underline decoration-ink/25 underline-offset-4 hover:text-cyan-deep">{email}</a>}{phone&&<a href={phone.href} className="mt-2 block font-semibold text-ink underline decoration-ink/25 underline-offset-4 hover:text-cyan-deep">{phone.display}</a>}<div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{socialLinks.map(([label,url])=><a key={label} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center font-display text-[11px] font-bold tracking-wide text-cyan-deep hover:underline 2xl:text-xs">{label.toUpperCase()}<span className="sr-only"> (yeni sekmede açılır)</span></a>)}</div><div className="mt-5 max-w-md"><NewsletterForm lang={en?"en":"tr"}/></div></div>{columns.map(column=><div className="min-w-0" key={column.title}><h3 className="font-display text-[13px] font-bold tracking-[2px] text-ink 2xl:text-sm">{column.title}</h3><ul className="mt-4 space-y-1.5 sm:space-y-2">{column.links.map(([label,href])=><li key={label}><Link href={href} className="inline-flex min-h-8 items-center text-[14px] text-ink/65 hover:text-cyan-deep 2xl:text-[15px]">{label}</Link></li>)}</ul></div>)}</div><div className="safe-x mx-auto flex max-w-7xl flex-col gap-4 border-t border-ink/10 py-5 text-[12px] text-ink/65 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:px-10 2xl:text-[13px]"><p>© 2026 RECF Türkiye | Intechne Teknoloji</p><div className="flex flex-wrap gap-x-4 gap-y-1"><Link href="/hukuki-belgeler" className="inline-flex min-h-8 items-center hover:text-cyan-deep">Hukuki Belgeler</Link><Link href="/kvkk" className="inline-flex min-h-8 items-center hover:text-cyan-deep">KVKK</Link><Link href="/acik-riza" className="inline-flex min-h-8 items-center hover:text-cyan-deep">Açık Rıza</Link><Link href="/katilim-onami" className="inline-flex min-h-8 items-center hover:text-cyan-deep">Katılım Onamı</Link><Link href="/gizlilik" className="inline-flex min-h-8 items-center hover:text-cyan-deep">Gizlilik</Link><Link href="/kullanim-kosullari" className="inline-flex min-h-8 items-center hover:text-cyan-deep">Kullanım Koşulları</Link><Link href="/cerez-politikasi" className="inline-flex min-h-8 items-center hover:text-cyan-deep">Çerezler</Link></div><p className="flex items-center gap-1.5 font-display font-medium tracking-wide">MAÇ GÜNÜ. HER GÜN. <FigmaIcon name="robot" className="h-4 w-4"/></p></div></footer>;
}
