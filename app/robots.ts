import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/portal", "/portal/", "/api/", "/cms-giris", "/giris", "/kayit/tesekkurler"] },
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: ["/", "/llms.txt"], disallow: ["/admin", "/portal", "/api/", "/cms-giris", "/giris", "/kayit/tesekkurler"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
