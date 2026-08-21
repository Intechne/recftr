"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import Logout from "@/components/Logout";
import {FigmaIcon,type FigmaIconName} from "@/components/FigmaIcon";
const nav:[string,string,FigmaIconName][]=[
["/portal","Panel","robot"],
["/portal/uyeler","Takım Üyeleri","mentor"],
["/portal/etkinlikler","Etkinlik Kayıtları","takvim"],
["/portal/belgeler","Belgeler","defter"],
["/portal/odemeler","Ödemeler","plaka"],
["/portal/ayarlar","Takım Ayarları","ayarlar"],
];
export default function Layout({children}:{children:React.ReactNode}){const p=usePathname();return <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[245px_1fr]"><aside className="bg-ink text-white lg:min-h-screen"><div className="border-b border-white/10 px-5 py-6"><p className="flex items-center gap-2 font-display text-[16px] font-bold text-cyan-brand"><FigmaIcon name="robot" className="h-5 w-5"/> TAKIM PORTALI</p><p className="mt-1 text-[11px] text-white/40">RECF Türkiye</p></div><nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">{nav.map(([h,l,ic])=><Link key={h} href={h} className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 font-display text-[12px] ${p===h?"bg-cyan-brand font-bold text-ink":"text-white/65 hover:bg-white/5 hover:text-white"}`}><FigmaIcon name={ic} className="h-[18px] w-[18px]"/>{l}</Link>)}</nav></aside><div><header className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-4"><span className="font-display text-[12px] font-bold tracking-wide">MENTOR / TAKIM YÖNETİMİ</span><Logout/></header><main className="p-6 lg:p-8">{children}</main></div></div>}
