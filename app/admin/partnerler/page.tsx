"use client";
import {useEffect,useState} from "react";
import {uploadFile} from "@/lib/client-upload";
type Partner={id?:number;name:string;logo_url:string;website_url:string;tier:string;sort_order:number;published:boolean};
const EMPTY:Partner={name:"",logo_url:"",website_url:"",tier:"",sort_order:0,published:false};
export default function Page(){
  const [list,setList]=useState<Partner[]>([]),[f,setF]=useState<Partner>(EMPTY),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
  const load=async()=>{try{const r=await fetch("/api/partners?all=1",{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);setList(Array.isArray(j)?j:[]);}catch(e:any){setMsg("Hata: "+(e.message||"Partnerler alınamadı."));}};
  useEffect(()=>{void load()},[]);
  const set=(k:keyof Partner,v:any)=>setF(x=>({...x,[k]:v}));
  async function logo(file?:File){if(!file)return;setBusy(true);try{const ext=(file.name.split(".").pop()||"png").toLowerCase();const slug=(f.name||"partner").toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"partner";const u=await uploadFile("media",new File([file],`partner-${slug}-logo.${ext}`,{type:file.type}));set("logo_url",u.url);setMsg("Başarılı: Logo yüklendi; Kaydet’e basın.");}catch(e:any){setMsg("Hata: "+e.message);}finally{setBusy(false);}}
  async function save(){setBusy(true);try{const r=await fetch("/api/partners",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});const j=await r.json();if(!r.ok)throw new Error(j.error||"Kaydedilemedi.");setMsg("Başarılı: Partner kaydedildi.");setF(EMPTY);void load();}catch(e:any){setMsg("Hata: "+e.message);}finally{setBusy(false);}}
  async function del(id?:number){if(!id||!confirm("Partner kaydı silinsin mi?"))return;const r=await fetch("/api/partners",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});const j=await r.json();setMsg(r.ok?"Başarılı: Partner silindi.":"Hata: "+(j.error||"Silinemedi."));void load();}
  const i="mt-1 w-full rounded-md border-[1.5px] border-ink/20 bg-white px-3 py-2.5 text-[13px]";
  return <div className="max-w-6xl">
    <h1 className="font-display text-[25px] font-bold">İŞ BİRLİĞİ PARTNERLERİ</h1>
    <p className="mt-1 text-[13px] text-ink/55">“Sponsorlar ve İş Birlikleri” sayfasındaki logo bölümü yalnız burada eklenen ve <b>yayında</b> işaretlenen kayıtları gösterir; hiç yayında kayıt yoksa bölüm görünmez. Yalnız yazılı iş birliği onayı olan kurumları yayınlayın.</p>
    {msg&&<p role="status" className={`mt-4 rounded-lg p-3 text-[13px] font-semibold ${msg.startsWith("Hata")?"bg-red-50 text-red-700":"bg-cyan-deep/10 text-cyan-deep"}`}>{msg}</p>}
    <div className="mt-5 grid gap-3 rounded-xl border-2 border-ink bg-white p-5 md:grid-cols-3">
      <label className="text-[11px] font-bold">KURUM ADI*<input className={i} value={f.name} onChange={e=>set("name",e.target.value)}/></label>
      <label className="text-[11px] font-bold">SEVİYE (opsiyonel)<input className={i} value={f.tier} onChange={e=>set("tier",e.target.value)} placeholder="Sezon Partneri"/></label>
      <label className="text-[11px] font-bold">SIRA<input type="number" className={i} value={f.sort_order} onChange={e=>set("sort_order",Number(e.target.value))}/></label>
      <label className="text-[11px] font-bold md:col-span-2">WEB SİTESİ (https://)<input className={i} value={f.website_url} onChange={e=>set("website_url",e.target.value.trim())}/></label>
      <label className="text-[11px] font-bold">LOGO*<input type="file" accept="image/png,image/webp,image/svg+xml,image/jpeg" className={i} onChange={e=>logo(e.target.files?.[0])}/><span className="mt-1 block font-normal text-ink/45">Şeffaf PNG/WebP, yatay, en az 480 px genişlik.</span></label>
      {f.logo_url&&<img src={f.logo_url} alt={`${f.name||"Partner"} logosu`} className="h-16 w-auto object-contain"/>}
      <div className="flex flex-wrap items-center gap-4 md:col-span-3"><label className="text-[13px] font-semibold"><input type="checkbox" checked={f.published} onChange={e=>set("published",e.target.checked)}/> Yayında</label><button disabled={busy} onClick={save} className="ml-auto rounded-md bg-ink px-5 py-2.5 font-display text-[12px] font-bold text-white disabled:opacity-50">KAYDET</button><button onClick={()=>setF(EMPTY)} className="rounded-md border border-ink/20 px-4 py-2 text-[12px]">TEMİZLE</button></div>
    </div>
    <div className="mt-5 space-y-2">{list.map(p=><div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-ink/15 bg-white p-4">{p.logo_url&&<img src={p.logo_url} alt="" className="h-10 w-20 object-contain"/>}<div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-[12px] text-ink/50">{p.tier||"—"} · sıra {p.sort_order} · {p.published?"YAYINDA":"TASLAK"}</p></div><button onClick={()=>setF({...p,published:!!p.published})} className="text-[11px] font-bold text-cyan-deep">DÜZENLE</button><button onClick={()=>del(p.id)} className="text-[11px] font-bold text-red-600">SİL</button></div>)}{list.length===0&&<p className="rounded-xl border-2 border-dashed border-ink/20 p-8 text-center text-ink/50">Henüz partner kaydı yok.</p>}</div>
  </div>;
}
