/** YouTube / Vimeo bağlantısını gizlilik dostu gömme adresine çevirir; desteklenmeyen adres için null. */
export function videoEmbedUrl(raw: string): string | null {
  let url: URL;
  try { url = new URL(String(raw || "").trim()); } catch { return null; }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const clean = (id: string | null | undefined) => (id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null);
  if (host === "youtu.be") { const id = clean(url.pathname.slice(1)); return id ? `https://www.youtube-nocookie.com/embed/${id}` : null; }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = clean(url.searchParams.get("v")) || clean(url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1]);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") { const id = url.pathname.match(/(\d{6,12})/)?.[1]; return id ? `https://player.vimeo.com/video/${id}` : null; }
  return null;
}
