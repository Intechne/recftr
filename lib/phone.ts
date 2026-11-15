/** Türkiye numarasını "0850 308 81 66" biçimine ve tel: bağlantısına çevirir. */
export function trPhone(raw: unknown): { display: string; href: string } | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  const national = digits.startsWith("90") && digits.length === 12 ? digits.slice(2) : digits.startsWith("0") && digits.length === 11 ? digits.slice(1) : digits.length === 10 ? digits : "";
  if (!national) return null;
  return { display: `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 8)} ${national.slice(8)}`, href: `tel:+90${national}` };
}
