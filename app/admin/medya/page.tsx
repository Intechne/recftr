"use client";

import { useEffect, useState } from "react";
import { uploadFile } from "@/lib/client-upload";

const imageSpecs = [
  ["Program kapağı", "1600 × 1200 px", "4:3"],
  ["Etkinlik kapağı", "1600 × 900 px", "16:9"],
  ["Haber / duyuru kapağı", "1600 × 900 px", "16:9"],
  ["Ana sayfa hero", "1600 × 1200 px", "4:3"],
  ["Galeri fotoğrafı", "1600 × 900 px", "16:9"],
  ["Ekip profil fotoğrafı", "800 × 800 px", "1:1"],
  ["Takım logosu", "800 × 800 px", "1:1"],
];

export default function Page() {
  const [list, setList] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await fetch("/api/media?all=1", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setList(Array.isArray(j) ? j : []);
    } catch (e: any) {
      setList([]);
      setMsg("Hata: " + (e.message || "Medya alınamadı."));
    }
  };

  useEffect(() => { void load(); }, []);

  async function save() {
    if (!file || !title) return setMsg("⚠ Başlık ve dosya zorunlu.");
    setBusy(true);
    try {
      const u = await uploadFile("media", file);
      const r = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type: file.type.startsWith("video/") ? "VİDEO" : "FOTO",
          event_slug: event,
          path: u.path,
          url: u.url,
          mime_type: file.type,
          size_bytes: file.size,
          alt_text: alt,
          caption,
          published: true,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Kaydedilemedi");
      setMsg("Başarılı: Medya yüklendi.");
      setFile(null); setTitle(""); setEvent(""); setAlt(""); setCaption("");
      void load();
    } catch (e: any) {
      setMsg("Hata: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  async function del(id: number) {
    if (!confirm("Medya silinsin mi?")) return;
    await fetch("/api/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    void load();
  }

  const i = "rounded-md border-[1.5px] border-ink/20 bg-white px-3 py-2.5 text-[13px]";
  return <div className="max-w-6xl">
    <h1 className="font-display text-[25px] font-bold">MEDYA KÜTÜPHANESİ</h1>
    <p className="text-[13px] text-ink/55">Gerçek Supabase Storage yükleme; public galeri ve içerik kapaklarında kullanılabilir.</p>

    <div className="mt-5 rounded-xl border border-cyan-deep/20 bg-cyan-deep/[.04] p-4">
      <p className="font-display text-[12px] font-bold tracking-wide text-cyan-deep">WEB GÖRSEL ÖLÇÜ REHBERİ</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {imageSpecs.map(([name, px, ratio]) => <div key={name} className="rounded-lg bg-white px-3 py-2 text-[12px] text-ink/65"><b className="text-ink">{name}</b><br/>{px} · {ratio}</div>)}
        <div className="rounded-lg bg-white px-3 py-2 text-[12px] text-ink/65"><b className="text-ink">Galeri videosu</b><br/>1920 × 1080 px · 16:9</div>
      </div>
      <p className="mt-3 text-[11px] text-ink/45">JPG/WebP fotoğraflarda ana konuyu merkezde tutun. Logo için PNG/WebP ve mümkünse transparan arka plan tercih edin.</p>
    </div>

    {msg && <p className="mt-4 rounded-lg bg-cyan-deep/10 p-3 text-[13px] font-semibold text-cyan-deep">{msg}</p>}
    <div className="mt-5 grid gap-3 rounded-xl border-2 border-ink bg-white p-5 md:grid-cols-3">
      <input className={i} placeholder="Başlık" value={title} onChange={e => setTitle(e.target.value)} />
      <input className={i} placeholder="Etkinlik slug (opsiyonel)" value={event} onChange={e => setEvent(e.target.value)} />
      <label className="text-[12px] font-semibold text-ink/70">Dosya
        <input type="file" accept="image/*,video/*" className={i + " mt-1 w-full"} onChange={e => setFile(e.target.files?.[0] || null)} />
        <span className="mt-1 block text-[11px] font-normal leading-relaxed text-ink/45">Fotoğraf: <b>1600 × 900 px</b> (16:9). Video: <b>1920 × 1080 px</b> (16:9). Galeri kartları 16:9 gösterilir.</span>
      </label>
      <input className={i} placeholder="Alt text" value={alt} onChange={e => setAlt(e.target.value)} />
      <input className={i} placeholder="Caption" value={caption} onChange={e => setCaption(e.target.value)} />
      <button disabled={busy} onClick={save} className="rounded-md bg-ink px-4 py-2.5 font-display text-[12px] font-bold text-white">{busy ? "YÜKLENİYOR…" : "YÜKLE"}</button>
    </div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map(m => <div key={m.id} className="overflow-hidden rounded-xl border border-ink/15 bg-white">
        {m.type === "VİDEO" ? <video src={m.url} className="aspect-video w-full object-cover" controls /> : <img src={m.url} alt={m.alt_text || m.title} className="aspect-video w-full object-cover" />}
        <div className="p-3"><p className="truncate font-semibold">{m.title}</p><p className="text-[11px] text-ink/45">{m.type} {m.event_slug && "· #" + m.event_slug}</p><div className="mt-2 flex gap-3 text-[11px] font-bold"><button onClick={() => navigator.clipboard.writeText(m.url)} className="text-cyan-deep">URL KOPYALA</button><button onClick={() => del(m.id)} className="text-red-600">SİL</button></div></div>
      </div>)}
    </div>
  </div>;
}
