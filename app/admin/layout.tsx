"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "@/components/Logout";

const menu = [
  { href: "/admin", label: "📊  Genel Bakış" },
  { href: "/admin/etkinlikler", label: "📅  Etkinlikler" },
  { href: "/admin/haberler", label: "📰  Haberler & Duyurular" },
  { href: "/admin/onaylar", label: "👥  Takım Onayları" },
  { href: "/admin/dokumanlar", label: "📄  Dokümanlar" },
  { href: "/admin/sayfalar", label: "📃  Sayfalar (KVKK vb.)" },
  { href: "/admin/medya", label: "🖼  Medya Kütüphanesi" },
  { href: "/admin/ekip", label: "🧑‍🤝‍🧑  Ekip & Yetkiler" },
  { href: "/admin/ayarlar", label: "⚙️  Site Ayarları" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[236px_1fr]">
      <aside className="bg-[#0a0f1e] lg:min-h-screen">
        <div className="px-5 py-6">
          <p className="font-display text-[16px] font-bold text-cyan-brand">⚙ RECF TR · CMS</p>
          <p className="mt-0.5 text-[11px] text-white/40">İçerik Yönetim Sistemi</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:pb-0">
          {menu.map((m) => {
            const active = path === m.href;
            return (
              <Link key={m.label} href={m.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 font-display text-[13px] lg:block ${
                  active ? "bg-cyan-brand font-bold text-ink" : "font-medium text-white/65 hover:bg-white/5 hover:text-white"}`}>
                {m.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-ink/10 bg-white px-7 py-4">
          <span className="font-display text-[13px] font-semibold tracking-[1px] text-ink">YÖNETİM PANELİ</span>
          <span className="flex items-center gap-4 text-[13px] font-semibold text-ink/55">
            <Link href="/" className="hover:text-cyan-deep">🌐 Siteyi Gör</Link> <span>Yönetici</span> <Logout />
          </span>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
