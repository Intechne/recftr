"use client";
import { useState } from "react";

export default function AdminHaberler() {
  const [title, setTitle] = useState("Kış Kupası kayıtları 1 Ekim'de açılıyor");
  const [excerpt, setExcerpt] = useState("Sezonun kapalı salon klasiği Kış Kupası için ön kayıt takvimi netleşti.");
  const [body, setBody] = useState("Kış Kupası, bu sezon 64 takım kapasitesiyle Aralık ayında İstanbul'da düzenlenecek.\n\nÖn kayıtlar 1 Ekim 09:00'da portal üzerinden açılacak; Founding 100 takımları 48 saat erken erişim hakkına sahip.");
  const [tag, setTag] = useState("DUYURU");
  const [published, setPublished] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; href?: string } | null>(null);
  const slugPart = title.toLowerCase()
    .replaceAll("ç","c").replaceAll("ğ","g").replaceAll("ı","i").replaceAll("ö","o").replaceAll("ş","s").replaceAll("ü","u")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 48);
  const slug = "/duyurular/" + slugPart;
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-ink/25 bg-paper px-3.5 py-3 text-[14px] outline-none focus:border-cyan-deep";
  const label = "font-display text-[11px] font-semibold tracking-[1px] text-ink/50";
  const pubRow = "flex items-center justify-between border-b border-ink/8 py-3 text-[13.5px]";

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
      <section className="rounded-xl border-[1.5px] border-ink bg-white p-6">
        <label className={label}>BAŞLIK</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={input + " font-semibold"} />
        <p className="mt-4"><span className={label}>URL (SLUG) — otomatik</span></p>
        <p className="mt-1.5 rounded-md bg-paper px-3.5 py-2.5 font-mono text-[13px] text-ink/70">{slug}</p>
        <p className="mt-4"><span className={label}>ÖZET (LİSTEDE GÖRÜNÜR)</span></p>
        <textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} className={input} />
        <div className="mt-5 flex gap-1 rounded-t-md bg-ink px-3.5 py-2.5 font-display text-[13px] font-semibold text-white">
          {["B","I","H2","H3","❝","🔗","📷","≣","•","1."].map((t) => (
            <button key={t} className="rounded px-2 py-0.5 hover:bg-white/15">{t}</button>
          ))}
        </div>
        <textarea rows={11} className="w-full rounded-b-md border-[1.5px] border-t-0 border-ink/25 bg-paper px-4 py-3.5 text-[14px] leading-relaxed outline-none focus:border-cyan-deep"
          defaultValue={`RECF Türkiye, 2026–27 sezonunu beş programın dört yeni oyunuyla açtı...\n\n[H2] Kayıtlar nasıl yapılır?\nTakım kayıtları recfevents.org üzerinden alınıyor...\n\n[ALINTI] "Bu sezon hedefimiz 45 ilde 500'den fazla takım..."\n\n[GÖRSEL: sezon-lansmani.jpg]`} />
      </section>

      <aside className="rounded-xl border-[1.5px] border-ink bg-white p-6">
        <h2 className="font-display text-[14px] font-bold text-ink">YAYIN AYARLARI</h2>
        <div className="mt-2">
          <div className={pubRow}><span className="text-ink/55">Durum</span>
            <span className="flex gap-2.5 font-semibold text-ink"><label className="flex items-center gap-1"><input type="radio" name="st" checked={!published} onChange={() => setPublished(false)} className="accent-cyan-deep" />Taslak</label><label className="flex items-center gap-1"><input type="radio" name="st" checked={published} onChange={() => setPublished(true)} className="accent-cyan-deep" />Yayında</label></span>
          </div>
          <div className={pubRow}><span className="text-ink/55">Kategori</span>
            <select value={tag} onChange={e => setTag(e.target.value)} className="rounded border-[1.5px] border-ink/25 px-2.5 py-1.5 font-semibold outline-none">{["DUYURU","ETKİNLİK","BAŞARI","BASINDA BİZ"].map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className={pubRow}><span className="text-ink/55">Etiketler</span><span className="font-semibold text-ink">sezon, kayıt, oyunlar</span></div>
          <div className={pubRow}><span className="text-ink/55">Kapak görseli</span><span className="font-semibold text-cyan-deep">📷 sezon-lansmani.jpg</span></div>
          <div className={pubRow}><span className="text-ink/55">Yayın tarihi</span><span className="font-semibold text-ink">12.08.2026 · 09:00</span></div>
          <div className={pubRow}><span className="text-ink/55">Yazar</span><span className="font-semibold text-ink">İletişim Ekibi</span></div>
        </div>
        <button onClick={async () => {
          const r = await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: slugPart, tag, title, excerpt, body, published }) });
          const j = await r.json();
          if (r.ok) setMsg({ ok: true, text: published ? "Yayınlandı! Siteden görüntüle:" : "Taslak kaydedildi.", href: published ? slug : undefined });
          else setMsg({ ok: false, text: j.error ?? "Yayınlanamadı." });
        }} className="mt-5 w-full rounded-md bg-cyan-brand py-3.5 font-display text-[15px] font-bold text-ink transition-colors hover:bg-ink hover:text-white">{published ? "YAYINLA" : "TASLAĞI KAYDET"}</button>
        {msg && <p className={`mt-3 rounded-lg border-2 px-3.5 py-2.5 text-[13px] font-semibold ${msg.ok ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-red-500 bg-red-50 text-red-700"}`}>
          {msg.text} {msg.href && <a href={msg.href} target="_blank" className="underline">{msg.href}</a>}
        </p>}
        <button className="mt-2.5 w-full rounded-md border-2 border-ink/20 py-3 font-display text-[13px] font-bold text-ink/60">TASLAĞI KAYDET</button>
      </aside>
    </div>
  );
}
