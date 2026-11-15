import Link from "next/link";
import RecfEventsLink from "@/components/analytics/RecfEventsLink";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** CMS metnindeki [metin](adres) bağlantılarını güvenli biçimde işler; HTML'e izin verilmez. */
export default function RichText({ text, linkClassName = "font-semibold text-cyan-deep underline decoration-cyan-deep/40 underline-offset-4 hover:decoration-cyan-deep" }: { text: string; linkClassName?: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0, index = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(<SafeLink key={index++} href={href} className={linkClassName}>{label}</SafeLink>);
    last = at + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function SafeLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href} className={className}>{children}</Link>;
  if (href.startsWith("#")) return <a href={href} className={className}>{children}</a>;
  if (/^https:\/\/(www\.)?recfevents\.org(\/|$)/i.test(href)) return <RecfEventsLink href={href} className={className}>{children}</RecfEventsLink>;
  if (/^https:\/\//i.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<span className="sr-only"> (yeni sekmede açılır)</span></a>;
  if (/^mailto:/i.test(href)) return <a href={href} className={className}>{children}</a>;
  return <>{children}</>;
}
