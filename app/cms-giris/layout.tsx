import type { Metadata } from "next";

// Yönetim girişi arama motorlarında görünmez (ayrıca X-Robots-Tag başlığı ve robots.txt).
export const metadata: Metadata = { title: "Yönetim Girişi", robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };

export default function CmsLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
