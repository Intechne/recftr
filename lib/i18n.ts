// Basit, bakımı kolay iki dilli yapı: Türkçe varsayılan, İngilizce sayfalar /en altında.
export const LOCALE_PAIRS: Array<[tr: string, en: string]> = [
  ["/", "/en"],
  ["/hakkimizda", "/en/about"],
  ["/sss", "/en/faq"],
  ["/programlar", "/en/programs"],
];

export const isEnglishPath = (path: string | null | undefined) => !!path && (path === "/en" || path.startsWith("/en/"));

/** Diğer dildeki karşılık; karşılığı olmayan sayfada diğer dilin ana sayfası. */
export function alternatePath(path: string) {
  const clean = (path || "/").split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (isEnglishPath(clean)) return LOCALE_PAIRS.find(([, en]) => en === clean)?.[0] || "/";
  return LOCALE_PAIRS.find(([tr]) => tr === clean)?.[1] || "/en";
}

/** Next metadata için hreflang alternates. */
export function languageAlternates(trPath: string, enPath: string, abs: (path: string) => string) {
  return { "tr-TR": abs(trPath), en: abs(enPath), "x-default": abs(trPath) };
}
