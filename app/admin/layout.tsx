"use client";
import Link from "next/link"; import {usePathname} from "next/navigation"; import Logout from "@/components/Logout"; import {useEffect,useState} from "react";
const ALL=[
["/admin","📊  Genel Bakış",["admin","editor","approvals","technical"]],
["/admin/programlar","🏆  Programlar",["admin","editor"]],
["/admin/etkinlikler","📅  Etkinlikler",["admin","editor"]],
["/admin/haberler","📰  Haberler & Duyurular",["admin","editor"]],
["/admin/dokumanlar","📄  Public Dokümanlar",["admin","editor"]],
["/admin/medya","🖼  Medya Kütüphanesi",["admin","editor"]],
["/admin/sayfalar","📃  Sayfalar",["admin","editor"]],
["/admin/onaylar","✅  Takım Başvuruları",["admin","approvals"]],
["/admin/takimlar","🤖  Takımlar",["admin","approvals"]],
["/admin/etkinlik-kayitlari","🎟  Etkinlik Kayıtları",["admin","approvals"]],
["/admin/belge-gereksinimleri","📋  Belge Gereksinimleri",["admin","approvals","technical"]],
["/admin/takim-belgeleri","🗂  Takım Belgeleri",["admin","approvals","technical"]],
["/admin/odemeler","💳  Ödemeler",["admin","approvals"]],
["/admin/iletisim","✉️  İletişim Kutusu",["admin","editor","approvals"]],
["/admin/ekip","🧑‍🤝‍🧑  Ekip & Yetkiler",["admin"]],
["/admin/ayarlar","⚙️  Site Ayarları",["admin","editor"]],
["/admin/audit","🧾  İşlem Geçmişi",["admin"]],
] as const;
export default function AdminLayout({children}:{children:React.ReactNode}){const path=usePathname();const [me,setMe]=useState<any>(null);useEffect(()=>{fetch("/api/session").then(r=>r.ok?r.json():null).then(setMe)},[]);const menu=ALL.filter(x=>!me||x[2].includes(me.role));return <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]"><aside className="bg-[#0a0f1e] lg:min-h-screen"><div className="px-5 py-6"><p className="font-display text-[16px] font-bold text-cyan-brand">⚙ RECF TR · CMS V3</p><p className="mt-0.5 text-[11px] text-white/40">İçerik + Operasyon Yönetimi</p></div><nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1">{menu.map(m=><Link key={m[0]} href={m[0]} className={`whitespace-nowrap rounded-lg px-3 py-2.5 font-display text-[12px] lg:block ${path===m[0]?"bg-cyan-brand font-bold text-ink":"text-white/65 hover:bg-white/5 hover:text-white"}`}>{m[1]}</Link>)}</nav></aside><div><header className="flex items-center justify-between border-b border-ink/10 bg-white px-7 py-4"><span className="font-display text-[13px] font-semibold tracking-[1px] text-ink">YÖNETİM PANELİ</span><span className="flex items-center gap-4 text-[12px] font-semibold text-ink/55"><Link href="/" className="hover:text-cyan-deep">🌐 Site</Link><span>{me?.name||"Yönetici"} · {me?.role||""}</span><Logout/></span></header><main className="p-6 lg:p-8">{children}</main></div></div>}
