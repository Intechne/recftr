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

export default function AdminLayout({children}:{children:React.ReactNode}){
  const path=usePathname();const[me,setMe]=useState<any>(null);const[open,setOpen]=useState(false);
  useEffect(()=>{fetch("/api/session").then(r=>r.ok?r.json():null).then(setMe)},[]);
  useEffect(()=>{setOpen(false)},[path]);
  const menu=ALL.filter(x=>!me||x[3].includes(me.role));
  const sidebar=<><div className="border-b border-white/10 px-5 py-5 lg:py-6"><p className="flex items-center gap-2 font-display text-[15px] font-bold text-cyan-brand 2xl:text-[17px]"><FigmaIcon name="ayarlar" className="h-5 w-5"/> RECF TR · CMS V3</p><p className="mt-0.5 text-[11px] text-white/40">İçerik + Operasyon Yönetimi</p></div><nav className="space-y-1 overflow-y-auto p-3 lg:max-h-[calc(100vh-92px)]">{menu.map(m=><Link key={m[0]} href={m[0]} className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 font-display text-[12px] 2xl:text-[13px] ${path===m[0]?"bg-cyan-brand font-bold text-ink":"text-white/65 hover:bg-white/5 hover:text-white"}`}><FigmaIcon name={m[2]} className="h-[18px] w-[18px] shrink-0"/><span>{m[1]}</span></Link>)}</nav></>;
  return <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[285px_minmax(0,1fr)]">
    <aside className="hidden bg-[#0a0f1e] lg:sticky lg:top-0 lg:block lg:h-screen">{sidebar}</aside>
    {open&&<><button type="button" aria-label="Menüyü kapat" className="app-drawer-backdrop fixed inset-0 z-[70] lg:hidden" onClick={()=>setOpen(false)}/><aside className="fixed inset-y-0 left-0 z-[80] w-[min(86vw,320px)] overflow-y-auto bg-[#0a0f1e] text-white shadow-2xl lg:hidden">{sidebar}</aside></>}
    <div className="min-w-0">
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-5 lg:px-7 2xl:min-h-[72px] 2xl:px-10">
        <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={()=>setOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-ink lg:hidden" aria-label="CMS menüsünü aç"><FigmaIcon name="ayarlar" className="h-5 w-5"/></button><span className="truncate font-display text-[12px] font-semibold tracking-[1px] text-ink sm:text-[13px] 2xl:text-[14px]">YÖNETİM PANELİ</span></div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4 text-[11px] font-semibold text-ink/55 sm:text-[12px]"><Link href="/" className="hidden items-center gap-1.5 hover:text-cyan-deep sm:flex"><FigmaIcon name="saha" className="h-4 w-4"/> Site</Link><span className="hidden max-w-[220px] truncate md:inline">{me?.name||"Yönetici"} · {me?.role||""}</span><Logout/></div>
      </header>
      <main className="min-w-0 p-4 sm:p-5 lg:p-8 2xl:p-10"><div className="mx-auto w-full max-w-[110rem]">{children}</div></main>
    </div>
  </div>;
}
