"use client";

import { useEffect, useState } from "react";
import { uploadFile } from "@/lib/client-upload";
import { FigmaIcon } from "@/components/FigmaIcon";

type RouteStep={month:string;label:string;done:boolean};
const DEFAULT_ROUTE:RouteStep[]=[
  {month:"EYL",label:"Kayıtlar",done:true},
  {month:"EKİ",label:"İl Etkinlikleri",done:true},
  {month:"ARA",label:"Bölge Turnuvaları",done:false},
  {month:"ŞUB",label:"Türkiye Şampiyonası",done:false},
  {month:"NİS",label:"Dünya Şampiyonası",done:false},
];
const KEYS=[
  "site_name","site_logo","site_mark","favicon_url","apple_touch_icon_url","og_image",
  "hero_title","hero_accent_title","hero_description","hero_image",
  "season_label","season_route_title","home_cta_title","home_cta_description","home_cta_plate",
  "home_show_programs","home_show_route","home_show_stats","home_show_events","home_show_news","home_show_gallery","home_show_cta",
  "contact_team","contact_info","contact_phone","instagram","youtube","linkedin","maintenance",
  "registration_fee_engage","registration_fee_achieve","registration_fee_inspire","registration_fee_adc","registration_fee_adc-pro","field_kit_fee","registration_discount"
];
const VISIBILITY:[string,string][]=[
  ["home_show_programs","Program plakaları"],["home_show_route","Sezon Rotası"],["home_show_stats","Canlı istatistik bandı"],
  ["home_show_events","Yaklaşan etkinlikler"],["home_show_news","Duyurular & Haberler"],["home_show_gallery","Sahadan / Galeri"],["home_show_cta","Takım plakası CTA"]
];
function parseList(v:any){try{const x=JSON.parse(v||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
function parseRoute(v:any):RouteStep[]{try{const x=JSON.parse(v||"[]");if(!Array.isArray(x)||x.length<2)return DEFAULT_ROUTE;return x.map((r:any)=>({month:String(r?.month||""),label:String(r?.label||""),done:!!r?.done})).filter((r:RouteStep)=>r.month&&r.label)}catch{return DEFAULT_ROUTE}}

export default function Page(){
  const [s,setS]=useState<any>({ticker:[],season_route:DEFAULT_ROUTE});
  const [newTicker,setNewTicker]=useState("");
  const [msg,setMsg]=useState("");
  const [saving,setSaving]=useState(false);
  const [role,setRole]=useState("");
  useEffect(()=>{fetch("/api/session",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>setRole(x?.role||""));fetch("/api/settings",{cache:"no-store"}).then(r=>r.json()).then(x=>setS({...x,ticker:parseList(x.ticker),season_route:parseRoute(x.season_route)})).catch(()=>setMsg("Hata: Site ayarları alınamadı."))},[]);
  const set=(k:string,v:any)=>setS((x:any)=>({...x,[k]:v}));
  const i="mt-1 w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3 py-2.5 text-[13px]";
  const checkbox=(key:string)=>s[key]!=="false";

  async function upload(k:string,file?:File){
    if(!file)return;
    try{const u=await uploadFile("media",file);set(k,u.url);setMsg("Başarılı: Görsel yüklendi. Değişikliği kalıcı yapmak için Tüm Ayarları Kaydet butonuna basın.")}
    catch(e:any){setMsg("Hata: "+(e?.message||"Görsel yüklenemedi."))}
  }
  async function save(){
    setSaving(true); setMsg("");
    try{
      const body:any={ticker:JSON.stringify(s.ticker||[]),season_route:JSON.stringify(s.season_route||DEFAULT_ROUTE)};
      for(const k of KEYS){if(role!=="admin" && ["registration_fee_engage","registration_fee_achieve","registration_fee_inspire","registration_fee_adc","registration_fee_adc-pro","field_kit_fee","registration_discount"].includes(k))continue;body[k]=String(s[k]??"");}
      const r=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const t=await r.text(); let j:any={}; try{j=t?JSON.parse(t):{}}catch{}
      if(!r.ok)throw new Error(j.error||t||`HTTP ${r.status}`);
      setMsg("Başarılı: Site ayarları ve ana sayfa deneyimi kaydedildi.");
    }catch(e:any){setMsg("Hata: "+(e?.message||"Kaydedilemedi."))}
    finally{setSaving(false)}
  }
  const asset=(k:string,label:string,help:string,previewClass="h-20 max-w-[260px] object-contain")=><label>{label}<input type="file" accept="image/*,.ico" className={i} onChange={e=>upload(k,e.target.files?.[0])}/><span className="mt-1 block text-[11px] leading-relaxed text-ink/45">{help}</span>{s[k]&&<img src={s[k]} alt={label} className={`mt-2 rounded border border-ink/10 bg-paper p-2 ${previewClass}`}/>}</label>;
  const updateRoute=(idx:number,patch:Partial<RouteStep>)=>set("season_route",(s.season_route||DEFAULT_ROUTE).map((r:RouteStep,i:number)=>i===idx?{...r,...patch}:r));

  return <div className="max-w-5xl">
    <h1 className="flex items-center gap-2 font-display text-[25px] font-bold"><FigmaIcon name="ayarlar" className="h-7 w-7"/> SİTE AYARLARI</h1>
    <p className="text-[13px] text-ink/55">Marka varlıkları, ana sayfa deneyimi, sezon rotası, iletişim, SEO ve kayıt ayarları.</p>
    {msg&&<p className={`mt-4 rounded-lg p-3 text-[13px] font-semibold ${msg.startsWith("Hata")?"bg-red-50 text-red-700":"bg-cyan-deep/10 text-cyan-deep"}`}>{msg}</p>}

    <section className="mt-5 rounded-xl border-2 border-ink bg-white p-4 sm:p-5">
      <div className="mb-4"><p className="font-display text-[14px] font-bold">MARKA & WEB SİTESİ İKONLARI</p><p className="mt-1 text-[12px] text-ink/50">Header/footer logosu, marka işareti, tarayıcı ikonu ve paylaşım görseli.</p></div>
      <div className="grid gap-5 md:grid-cols-2"><label>Site adı<input className={i} value={s.site_name||""} onChange={e=>set("site_name",e.target.value)}/></label><div/>
        {asset("site_logo","Web sitesi ana logosu","Önerilen: 1000 × 280 px veya benzer yatay oran, şeffaf PNG/WebP. Header ve footer alanında kullanılır.")}
        {asset("site_mark","Kare marka işareti","Önerilen: 512 × 512 px (1:1), transparan PNG/WebP.","h-24 w-24 object-contain")}
        {asset("favicon_url","Web sitesi ikonu / Favicon","Önerilen: 512 × 512 px (1:1), PNG veya ICO.","h-20 w-20 object-contain")}
        {asset("apple_touch_icon_url","Apple Touch Icon","Önerilen: 180 × 180 px (1:1), PNG.","h-20 w-20 object-contain")}
        <div className="md:col-span-2">{asset("og_image","Sosyal paylaşım / Open Graph görseli","Önerilen: 1200 × 630 px.","h-40 w-full max-w-xl object-cover")}</div>
      </div>
    </section>

    <section className="mt-5 rounded-xl border-2 border-ink bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3"><FigmaIcon name="rota" className="mt-0.5 h-6 w-6 shrink-0"/><div><p className="font-display text-[14px] font-bold">ANA SAYFA DENEYİMİ & SEZON ROTASI</p><p className="mt-1 text-[12px] text-ink/50">Full CMS öncesindeki hareketli ana sayfa bölümlerini buradan yönetin. İstatistik sayıları veritabanından otomatik gelir.</p></div></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><label>Hero ana başlık<input className={i} value={s.hero_title||""} onChange={e=>set("hero_title",e.target.value)} placeholder="MAÇ GÜNÜ"/></label><label>Hero cyan vurgu satırı<input className={i} value={s.hero_accent_title||""} onChange={e=>set("hero_accent_title",e.target.value)} placeholder="HER GÜN."/></label><label className="md:col-span-2">Hero açıklama<textarea rows={3} className={i} value={s.hero_description||""} onChange={e=>set("hero_description",e.target.value)}/></label><label className="md:col-span-2">Hero görseli<input type="file" accept="image/*" className={i} onChange={e=>upload("hero_image",e.target.files?.[0])}/><span className="mt-1 block text-[11px] leading-relaxed text-ink/45">Önerilen: <b>1600 × 1200 px</b> (4:3). Sezon Oyunları panelinde üst görsel olarak kullanılır.</span></label>{s.hero_image&&<img src={s.hero_image} alt="Hero" className="h-40 rounded-lg object-cover md:col-span-2"/>}<label>Sezon etiketi<input className={i} value={s.season_label||""} onChange={e=>set("season_label",e.target.value)} placeholder="2026–27"/></label><label>Rota başlığı<input className={i} value={s.season_route_title||""} onChange={e=>set("season_route_title",e.target.value)} placeholder="SEZON ROTASI"/></label></div>

      <div className="mt-5 rounded-lg bg-paper p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-display text-[12px] font-bold">ROTA ADIMLARI</p><button type="button" onClick={()=>set("season_route",[...(s.season_route||DEFAULT_ROUTE),{month:"AY",label:"Yeni durak",done:false}])} className="rounded bg-ink px-3 py-2 text-[11px] font-bold text-white">ADIM EKLE</button></div>
        <div className="mt-3 space-y-2">{(s.season_route||DEFAULT_ROUTE).map((r:RouteStep,idx:number)=><div key={idx} className="grid gap-2 rounded-lg border border-ink/10 bg-white p-3 sm:grid-cols-[90px_1fr_auto_auto] sm:items-center"><input className={i+" mt-0"} value={r.month} onChange={e=>updateRoute(idx,{month:e.target.value.toUpperCase()})} placeholder="EYL"/><input className={i+" mt-0"} value={r.label} onChange={e=>updateRoute(idx,{label:e.target.value})} placeholder="Kayıtlar"/><label className="flex min-h-11 items-center gap-2 whitespace-nowrap text-[12px] font-semibold"><input type="checkbox" checked={!!r.done} onChange={e=>updateRoute(idx,{done:e.target.checked})}/> Tamamlandı</label><button type="button" onClick={()=>set("season_route",s.season_route.filter((_:RouteStep,i:number)=>i!==idx))} className="min-h-11 px-2 text-[11px] font-bold text-red-600">SİL</button></div>)}</div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2"><label>Alt CTA başlığı<input className={i} value={s.home_cta_title||""} onChange={e=>set("home_cta_title",e.target.value)} placeholder="PLAKAN HAZIR. SAHAYA ÇIK."/></label><label>Örnek takım plakası<input className={i} value={s.home_cta_plate||""} onChange={e=>set("home_cta_plate",e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,10))} placeholder="123A"/></label><label className="md:col-span-2">Alt CTA açıklaması<textarea rows={3} className={i} value={s.home_cta_description||""} onChange={e=>set("home_cta_description",e.target.value)}/></label></div>

      <div className="mt-5"><p className="font-display text-[12px] font-bold">ANA SAYFA BÖLÜMLERİ</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{VISIBILITY.map(([k,l])=><label key={k} className="flex min-h-12 items-center gap-3 rounded-lg border border-ink/10 bg-paper px-3 text-[12px] font-semibold"><input type="checkbox" checked={checkbox(k)} onChange={e=>set(k,e.target.checked?"true":"false")}/>{l}</label>)}</div></div>
    </section>

    <section className="mt-5 rounded-xl border-2 border-ink bg-white p-4 sm:p-5"><p className="flex items-center gap-2 font-display text-[13px] font-bold"><FigmaIcon name="anons" className="h-5 w-5"/> DUYURU ŞERİDİ</p><div className="mt-3 space-y-2">{(s.ticker||[]).map((t:string,idx:number)=><div key={idx} className="flex gap-2"><input className={i+" mt-0 flex-1"} value={t} onChange={e=>set("ticker",s.ticker.map((x:string,i:number)=>i===idx?e.target.value:x))}/><button onClick={()=>set("ticker",s.ticker.filter((_:string,i:number)=>i!==idx))} className="px-3 text-red-600">SİL</button></div>)}</div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input className={i+" mt-0 flex-1"} value={newTicker} onChange={e=>setNewTicker(e.target.value)} placeholder="Yeni duyuru"/><button onClick={()=>{if(newTicker.trim()){set("ticker",[...(s.ticker||[]),newTicker.trim()]);setNewTicker("")}}} className="rounded bg-cyan-brand px-4 py-2 font-bold">EKLE</button></div></section>

    <section className="mt-5 grid gap-4 rounded-xl border-2 border-ink bg-white p-4 sm:p-5 md:grid-cols-2">{[["contact_team","Takım e-posta"],["contact_info","Genel e-posta"],["contact_phone","Telefon"],["instagram","Instagram"],["youtube","YouTube"],["linkedin","LinkedIn"]].map(([k,l])=><label key={k}>{l}<input className={i} value={s[k]||""} onChange={e=>set(k,e.target.value)}/></label>)}</section>
    {role==="admin"?<section className="mt-5 grid gap-4 rounded-xl border-2 border-ink bg-white p-4 sm:p-5 md:grid-cols-4"><p className="md:col-span-4 font-display text-[13px] font-bold">KAYIT ÜCRETLERİ (TL) · ADMIN ONLY</p>{[["registration_fee_engage","ENG"],["registration_fee_achieve","ACH"],["registration_fee_inspire","INS"],["registration_fee_adc","ADC"],["registration_fee_adc-pro","PRO"],["field_kit_fee","Saha Kiti"],["registration_discount","İndirim"]].map(([k,l])=><label key={k}>{l}<input type="number" className={i} value={s[k]||"0"} onChange={e=>set(k,e.target.value)}/></label>)}</section>:<section className="mt-5 rounded-xl border border-ink/15 bg-white p-4 text-[12px] text-ink/55">Kayıt ücretleri ve finansal ayarlar yalnız <b>admin</b> rolü tarafından değiştirilebilir.</section>}
    <button disabled={saving} onClick={save} className="mt-5 min-h-12 rounded-md bg-ink px-6 py-3 font-display text-[13px] font-bold text-white disabled:opacity-50">{saving?"KAYDEDİLİYOR…":"TÜM AYARLARI KAYDET"}</button>
  </div>
}
