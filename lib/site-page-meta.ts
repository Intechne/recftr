import type { Metadata } from "next";
import { abs, pageMeta } from "@/lib/seo";
import { LOCALE_PAIRS, languageAlternates } from "@/lib/i18n";
import { sitePage } from "@/lib/site-pages";

/** Site sayfası metadata'sı: başlık/açıklama kayıt defterinden, hreflang dil çiftinden. */
export function sitePageMetadata(slug: string, options: { noIndex?: boolean } = {}): Metadata {
  const page = sitePage(slug);
  if (!page) return {};
  const pair = LOCALE_PAIRS.find(([tr, en]) => tr === page.path || en === page.path);
  return pageMeta({
    title: page.metaTitle,
    description: page.description,
    path: page.path,
    lang: page.lang,
    noIndex: options.noIndex,
    languages: pair ? languageAlternates(pair[0], pair[1], abs) : undefined,
  });
}
