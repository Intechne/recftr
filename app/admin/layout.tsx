"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import Logout from "@/components/Logout";
import {useEffect,useState} from "react";
import {FigmaIcon, type FigmaIconName} from "@/components/FigmaIcon";

const ALL:[string,string,FigmaIconName,readonly string[]][]=[
["/admin","Genel Bakış","istatistik",["admin","editor","approvals","technical"]],
["/admin/programlar","Programlar","kupa",["admin","editor"]],
["/admin/etkinlikler","Etkinlikler","takvim",["admin","editor"]],
["/admin/haberler","Haberler & Duyurular","anons",["admin","editor"]],
["/admin/dokumanlar","Public Dokümanlar","defter",["admin","editor"]],
["/admin/medya","Medya Kütüphanesi","yayin",["admin","editor"]],
["/admin/sayfalar","Sayfalar","plaka",["admin","editor"]],
["/admin/onaylar","Takım Başvuruları","kayit",["admin","approvals"]],
["/admin/takimlar","Takımlar","robot",["admin","approvals"]],
["/admin/etkinlik-kayitlari","Etkinlik Kayıtları","rozet",["admin","approvals"]],
["/admin/belge-gereksinimleri","Belge Gereksinimleri","defter",["admin","approvals","technical"]],
["/admin/takim-belgeleri","Takım Belgeleri","guven",["admin","approvals","technical"]],
["/admin/odemeler","Ödemeler","plaka",["admin","approvals"]],
["/admin/iletisim","İletişim Kutusu","anons",["admin","editor","approvals"]],
["/admin/ekip","Ekip & Yetkiler","mentor",["admin"]],
["/admin/ayarlar","Site Ayarları","ayarlar",["admin","editor"]],
["/admin/audit","İşlem Geçmişi","rota",["admin"]],
["/admin/sistem","Sistem Tanılama","guven",["admin"]],
];
export default function AdminLayout({children}:{children:React.ReactNode}){const path=usePathname();const [me,setMe]=useState<any>(null);useEffect(()=>{fetch("/api/session").then(r=>r.ok?r.json():null).then(setMe)},[]);const menu=ALL.filter(x=>!me||x[3].includes(me.role));return <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]"><aside className="bg-[#0a0f1e] lg:min-h-screen"><div className="px-5 py-6"><p className="flex items-center gap-2 font-display text-[16px] font-bold text-cyan-brand"><FigmaIcon name="ayarlar" className="h-5 w-5"/> RECF TR · CMS V3</p><p className="mt-0.5 text-[11px] text-white/40">İçerik + Operasyon Yönetimi</p></div><nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1">{menu.map(m=><Link key={m[0]} href={m[0]} className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 font-display text-[12px] lg:flex ${path===m[0]?"bg-cyan-brand font-bold text-ink":"text-white/65 hover:bg-white/5 hover:text-white"}`}><FigmaIcon name={m[2]} className="h-[18px] w-[18px] shrink-0"/><span>{m[1]}</span></Link>)}</nav></aside><div><header className="flex items-center justify-between border-b border-ink/10 bg-white px-7 py-4"><span className="font-display text-[13px] font-semibold tracking-[1px] text-ink">YÖNETİM PANELİ</span><span className="flex items-center gap-4 text-[12px] font-semibold text-ink/55"><Link href="/" className="flex items-center gap-1.5 hover:text-cyan-deep"><FigmaIcon name="saha" className="h-4 w-4"/> Site</Link><span>{me?.name||"Yönetici"} · {me?.role||""}</span><Logout/></span></header><main className="p-6 lg:p-8">{children}</main></div></div>}
