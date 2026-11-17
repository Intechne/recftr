"use client";
import { usePathname } from "next/navigation";
import { RECF_EVENTS_URL } from "@/lib/site-config";
import { trackEvent } from "@/components/analytics/track";

/** RECFEvents.org'a giden dış bağlantı; tıklama huni olayı olarak işaretlenir. */
export default function RecfEventsLink({ href = RECF_EVENTS_URL, className, children, placement }: { href?: string; className?: string; children: React.ReactNode; placement?: string }) {
  const path = usePathname();
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => trackEvent("recfevents_click", { from: path, placement: placement || "inline" })}>{children}<span className="sr-only">{path?.startsWith("/en") ? " (opens in a new tab)" : " (yeni sekmede açılır)"}</span></a>;
}
