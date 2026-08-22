"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import Logout from "@/components/Logout";
import {FigmaIcon,type FigmaIconName} from "@/components/FigmaIcon";
const nav:[string,string,FigmaIconName][]=[
["/portal","Panel","profile"],
["/portal/uyeler","Takım Üyeleri","members"],
["/portal/etkinlikler","Etkinlik Kayıtları","portal-events"],
["/portal/belgeler","Belgeler","portal-docs"],
["/portal/odemeler","Ödemeler","portal-payments"],
["/portal/ayarlar","Takım Ayarları","settings"],
];
export default function Layout({children}:{children:React.ReactNode}){
  const p=usePathname();const[open,setOpen]=useState(false);useEffect(()=>setOpen(false),[p]);
  const side=<><div className="border-b border-white/10 px-5 py-5 lg:py-6"><p className="flex items-center gap-2 font-display text-[16px] font-bold text-cyan-brand 2xl:text-[18px]"><FigmaIcon name="profile" className="h-5 w-5"/> TAKIM PORTALI</p><p className="mt-1 text-[11px] text-white/40">RECF Türkiye</p></div><nav className="space-y-1 p-3">{nav.map(([h,l,ic])=><Link key={h} href={h} className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 font-display text-[12px] 2xl:text-[13px] ${p===h?"bg-cyan-brand font-bold text-ink [--figma-icon-accent:#0D1733]":"text-white/65 hover:bg-white/5 hover:text-white"}`}><FigmaIcon name={ic} className="h-[18px] w-[18px] shrink-0"/>{l}</Link>)}</nav></>;
  return <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[245px_minmax(0,1fr)] 2xl:grid-cols-[270px_minmax(0,1fr)]"><aside className="hidden bg-ink text-white lg:sticky lg:top-0 lg:block lg:h-screen">{side}</aside>{open&&<><button type="button" aria-label="Menüyü kapat" className="app-drawer-backdrop fixed inset-0 z-[70] lg:hidden" onClick={()=>setOpen(false)}/><aside className="fixed inset-y-0 left-0 z-[80] w-[min(86vw,310px)] overflow-y-auto bg-ink text-white shadow-2xl lg:hidden">{side}</aside></>}<div className="min-w-0"><header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-5 lg:px-6 2xl:min-h-[72px] 2xl:px-9"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={()=>setOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-ink lg:hidden" aria-label="Takım portalı menüsünü aç"><FigmaIcon name="profile" className="h-5 w-5"/></button><span className="truncate font-display text-[11px] font-bold tracking-wide sm:text-[12px] 2xl:text-[13px]">MENTOR / TAKIM YÖNETİMİ</span></div><Logout/></header><main className="min-w-0 p-4 sm:p-5 lg:p-8 2xl:p-10"><div className="mx-auto w-full max-w-[100rem]">{children}</div></main></div></div>;
}
