"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "@/components/Logout";

const menu = [
  { href: "/portal", label: "🏠  Panel" },
  { href: "/portal/uyeler", label: "👥  Takım Üyeleri" },
  { href: "/portal/etkinlikler", label: "📅  Etkinlik Kayıtları" },
  { href: "/portal/belgeler", label: "📄  Belgeler" },
  { href: "/portal/odemeler", label: "💳  Ödemeler" },
  { href: "/portal/ayarlar", label: "⚙️  Takım Ayarları" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="bg-ink lg:min-h-screen">
        <div className="flex items-center justify-between px-6 py-6 lg:block">
          <Link href="/portal" className="font-display text-[17px] font-bold text-cyan-brand">⬡ TAKIM PORTALI</Link>
          <Link href="/" className="text-[12px] text-white/50 hover:text-white lg:mt-1 lg:block">← siteye dön</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1.5 lg:pb-0">
          {menu.map((m) => {
            const active = path === m.href;
            return (
              <Link key={m.label} href={m.href}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2.5 font-display text-[14px] lg:block ${
                  active ? "bg-cyan-brand font-bold text-ink" : "font-medium text-white/70 hover:bg-white/5 hover:text-white"}`}>
                {m.label}
              </Link>
            );
          })}
        </nav>
        <div className="mx-4 mt-8 hidden rounded-xl border-[1.5px] border-cyan-brand bg-white/5 p-4 lg:block">
          <p className="font-display text-[26px] font-bold tracking-[2px] text-white">905A</p>
          <p className="mt-1 font-display text-[10px] font-medium tracking-[0.5px] text-cyan-brand">VOLTRAN ROBOTICS · ACH</p>
        </div>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-ink/10 bg-white px-7 py-4">
          <span className="font-display text-[14px] font-semibold tracking-[1px] text-ink">TAKIM YÖNETİM SİSTEMİ</span>
          <span className="flex items-center gap-4 text-[13.5px] font-semibold text-ink/55">🔔 <span>Mentor: A. Yılmaz</span> <Logout /></span>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
