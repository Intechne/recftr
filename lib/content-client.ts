export function notifyPublicContentChanged() {
  try { localStorage.setItem("recf-content-changed", String(Date.now())); } catch {}
}
