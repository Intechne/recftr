// Resmî takım numarası RECFEvents.org'da atanır. Başvuruda numara verilmezse iç kayıt için geçici bir anahtar
// üretilir ("TBD" + 6 hex). Bu anahtar herkese açık sayfalarda takım numarası olarak gösterilmez.
export const PROVISIONAL_TEAM_NUMBER = /^TBD[0-9A-F]{6}$/;

export function provisionalTeamNumber() {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return `TBD${Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function isProvisionalTeamNumber(num: unknown) {
  return PROVISIONAL_TEAM_NUMBER.test(String(num ?? ""));
}

/** Herkese açık görünüm: geçici anahtar yerine boş döner. */
export function publicTeamNumber(num: unknown) {
  const value = String(num ?? "");
  return isProvisionalTeamNumber(value) ? "" : value;
}
