"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchArray, fetchObject } from "@/lib/client-api";

type Program = { slug:string; code:string; name:string; age?:string; color_hex?:string };
type Event = { id:number|string; slug:string; code?:string; title:string; cover_url?:string; date_label?:string; city?:string; registered?:number; capacity?:number; status?:string };
type News = { id:number|string; slug:string; tag?:string; title:string; excerpt?:string };
type Media = { id:number|string; type?:string; url:string; alt_text?:string; title?:string };
type Settings = { hero_title?:string; hero_description?:string; hero_image?:string };

export default function Home() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetchArray<Program>("/api/programs"),
      fetchArray<Event>("/api/events"),
      fetchArray<News>("/api/news"),
      fetchArray<Media>("/api/media"),
      fetchObject<Settings>("/api/settings", {}),
    ]).then(([programRows, eventRows, newsRows, mediaRows, publicSettings]) => {
      if (!active) return;
      setPrograms(programRows);
      setEvents(eventRows);
      setNews(newsRows);
      setMedia(mediaRows);
      setSettings(publicSettings);
    });
    return () => { active = false; };
  }, []);

  return <>
    <section className="field-grid relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-24">
        <div>
          <span className="inline-flex rounded bg-ink px-3.5 py-2 font-display text-[12px] font-semibold tracking-[1.5px] text-cyan-brand">⬡ RECF TÜRKİYE</span>
          <h1 className="mt-6 font-display text-[50px] font-bold leading-[.95] text-ink lg:text-[82px]">{settings.hero_title || "MAÇ GÜNÜ HER GÜN."}</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/60">{settings.hero_description || "Türkiye’nin robotik ve drone yarışma programları."}</p>
          <div className="mt-8 flex gap-3">
            <Link href="/kayit" className="rounded-md bg-ink px-5 py-3 font-display text-[13px] font-bold text-white">TAKIM NUMARANI AL</Link>
            <Link href="/programlar" className="rounded-md border-2 border-ink px-5 py-3 font-display text-[13px] font-bold">PROGRAMLAR</Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border-2 border-ink bg-ink">
          {settings.hero_image ? <img src={settings.hero_image} alt="RECF Türkiye" className="aspect-[4/3] w-full object-cover"/> : <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-cyan-deep to-ink font-display text-[64px] font-bold text-cyan-brand">RECF</div>}
        </div>
      </div>
    </section>

    <section className="bg-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <h2 className="font-display text-[34px] font-bold">PROGRAMLAR</h2>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {programs.map(p => <Link key={p.slug} href={`/programlar/${p.slug}`} className="overflow-hidden rounded-xl border-2 border-ink bg-white shadow-plateSm" style={{["--tw-shadow-color" as string]: p.color_hex || "#29B9E5"}}>
          <div className="p-4 font-display text-[28px] font-bold text-white" style={{background:p.color_hex || "#29B9E5"}}>{p.code}</div>
          <div className="p-4"><b className="font-display">{p.name}</b><p className="mt-2 text-[12px] text-ink/55">{p.age}</p></div>
        </Link>)}
        {programs.length === 0 && <p className="col-span-full text-sm text-ink/45">Program verileri şu anda yüklenemiyor veya henüz yayınlanmış program yok.</p>}
      </div>
    </div></section>

    <section><div className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <div className="flex justify-between"><h2 className="font-display text-[30px] font-bold">YAKLAŞAN ETKİNLİKLER</h2><Link href="/etkinlikler" className="font-bold text-cyan-deep">TÜMÜ →</Link></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {events.slice(0,6).map(e => <Link key={e.id} href={`/etkinlikler/${e.slug}`} className="overflow-hidden rounded-xl border-2 border-ink bg-white">
          <div className="h-36 bg-ink">{e.cover_url && <img src={e.cover_url} alt="" className="h-full w-full object-cover"/>}</div>
          <div className="p-5"><span className="rounded bg-cyan-brand px-2 py-1 text-[10px] font-bold">{e.code}</span><h3 className="mt-3 font-display text-[18px] font-bold">{e.title}</h3><p className="mt-1 text-[13px] text-ink/55">{e.date_label} · {e.city}</p><p className="mt-3 text-[12px] font-bold text-cyan-deep">{e.registered ?? 0}/{e.capacity ?? 0} takım · {e.status}</p></div>
        </Link>)}
        {events.length === 0 && <p className="text-ink/45">Yayınlanmış etkinlik henüz yok.</p>}
      </div>
    </div></section>

    <section className="bg-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <div className="flex justify-between"><h2 className="font-display text-[30px] font-bold">SON DUYURULAR</h2><Link href="/duyurular" className="font-bold text-cyan-deep">TÜMÜ →</Link></div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{news.slice(0,3).map(n => <Link key={n.id} href={`/duyurular/${n.slug}`} className="rounded-xl border border-ink/15 bg-paper p-5"><span className="text-[10px] font-bold text-cyan-deep">{n.tag}</span><h3 className="mt-2 font-display text-[17px] font-bold">{n.title}</h3><p className="mt-2 text-[13px] text-ink/55">{n.excerpt}</p></Link>)}</div>
    </div></section>

    {media.length > 0 && <section><div className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <div className="flex justify-between"><h2 className="font-display text-[30px] font-bold">GALERİ</h2><Link href="/galeri" className="font-bold text-cyan-deep">TÜMÜ →</Link></div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{media.filter(m => String(m.type || "").toUpperCase() !== "VİDEO").slice(0,8).map(m => <img key={m.id} src={m.url} alt={m.alt_text || m.title || "RECF Türkiye"} className="aspect-video w-full rounded-lg object-cover"/>)}</div>
    </div></section>}
  </>;
}
