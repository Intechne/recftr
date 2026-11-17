/** CMS'ten gelen renkli rozetler için okunur metin rengi: beyaz ≥4.5:1 değilse mürekkep. */
export function badgeTextColor(hex?: string | null) {
  const m = String(hex || "").trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return "#10192F";
  const channel = (i: number) => { const c = parseInt(m[1].slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return 1.05 / (luminance + 0.05) >= 4.5 ? "#fff" : "#10192F";
}

/** Koyu zeminde (ör. hero) görünmeyecek kadar koyu rozet renkleri için açık zeminli varyant. */
export function badgeStyleOnDark(hex?: string | null) {
  const color = /^#?[0-9a-f]{6}$/i.test(String(hex || "").trim()) ? `#${String(hex).trim().replace(/^#/, "")}` : "#29B9E5";
  const m = color.slice(1);
  const channel = (i: number) => { const c = parseInt(m.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance < 0.06 ? { backgroundColor: "#FFFFFF", color, boxShadow: `inset 0 0 0 2px ${color}` } : { backgroundColor: color, color: badgeTextColor(color) };
}
