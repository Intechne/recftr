import Link from "next/link";
import {FigmaIcon} from "@/components/FigmaIcon";

/* Sayfa başlığı bandı */
export function PageHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="safe-x mx-auto max-w-7xl pb-7 pt-9 sm:pb-8 sm:pt-12 lg:px-10 2xl:pt-14">
      <p className="flex items-center gap-1.5 font-display text-[12px] font-semibold tracking-[2px] text-cyan-deep"><FigmaIcon name="robot" className="h-4 w-4"/> {kicker}</p>
      <h1 className="mt-2.5 font-display text-[clamp(2rem,8vw,3.25rem)] font-bold leading-[1.02] text-ink lg:text-[52px] 2xl:text-[58px]">{title}</h1>
      {sub && <p className="mt-3.5 max-w-2xl text-[15px] leading-relaxed text-ink/60 sm:text-[16px] 2xl:text-[17px]">{sub}</p>}
    </div>
  );
}

/* Lig kodu rozeti */
export function CodeBadge({ code, hex, big = false }: { code: string; hex: string; big?: boolean }) {
  const light = hex === "#29B9E5" || hex === "#8DC63F";
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-display font-bold ${big ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}
      style={{ backgroundColor: hex, color: light ? "#10192F" : "#fff" }}
    >
      {code}
    </span>
  );
}

/* Durum etiketi */
export function StatusPill({ status }: { status: "open" | "full" | "soon" | "onaylı" | "ödeme" }) {
  const map = {
    open:   { t: "KAYIT AÇIK", cls: "border-green-700 bg-green-50 text-green-800 pulse-soft" },
    full:   { t: "DOLU", cls: "border-red-600 bg-red-50 text-red-700" },
    soon:   { t: "YAKINDA", cls: "border-ink/30 bg-ink/5 text-ink/60" },
    "onaylı": { t: "ONAYLI", cls: "border-green-700 bg-green-50 text-green-800" },
    "ödeme":  { t: "ÖDEME BEKLİYOR", cls: "border-amber-600 bg-amber-50 text-amber-700" },
  }[status];
  return (
    <span className={`inline-block rounded border px-3 py-1.5 font-display text-[11px] font-semibold ${map.cls}`}>
      {map.t}
    </span>
  );
}

/* Ana CTA butonları */
export function BtnPrimary({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href}
      className={`plate-hover inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 font-display text-[14px] font-bold sm:px-6 sm:py-3.5 sm:text-[15px] ${
        dark ? "bg-ink text-white shadow-plateSm shadow-cyan-brand" : "bg-cyan-brand text-ink shadow-plateSm shadow-ink/20"}`}>
      {children}
    </Link>
  );
}
export function BtnGhost({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-md border-2 px-5 py-3 font-display text-[14px] font-bold transition-colors sm:px-6 sm:py-3.5 sm:text-[15px] ${
        light ? "border-white/40 text-white hover:border-white" : "border-ink bg-white text-ink hover:bg-ink hover:text-white"}`}>
      {children}
    </Link>
  );
}

/* Bölüm başlığı */
export function SectionHead({ title, action, actionHref }: { title: string; action?: string; actionHref?: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-display text-[24px] font-bold leading-tight text-ink sm:text-[26px] lg:text-[34px] 2xl:text-[38px]">{title}</h2>
      {action && actionHref && (
        <Link href={actionHref} className="font-display text-[14px] font-semibold text-cyan-deep hover:underline">{action} →</Link>
      )}
    </div>
  );
}

/* Foto placeholder */
export function Photo({ label, tone, className = "", accent }: { label: string; tone: string; className?: string; accent?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${tone} ${className}`}
      style={accent ? { borderBottom: `4px solid ${accent}` } : undefined}
      role="img" aria-label={label}
    >
      <span className="absolute bottom-3.5 left-4 flex items-center gap-1.5 text-[11.5px] text-white/70"><FigmaIcon name="yayin" className="h-4 w-4"/> {label}</span>
    </div>
  );
}
