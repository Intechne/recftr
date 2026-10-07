"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {COMMITTEE_STATUSES,committeeAreaLabel,type CommitteeApplication,type CommitteeStatus} from "@/lib/planning-committee";

type Review=Pick<CommitteeApplication,"id"|"status"|"review_notes"|"version"|"updated_at">;
function ApplicationCard({application,onSaved}:{application:CommitteeApplication;onSaved:(record:Review)=>void}){
  const [status,setStatus]=useState(application.status),[notes,setNotes]=useState(application.review_notes);
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  useEffect(()=>{setStatus(application.status);setNotes(application.review_notes);},[application.status,application.review_notes,application.version]);
  async function save(){
    setBusy(true);setError("");
    try{
      const response=await fetch(`/api/planning-committee/${application.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,notes,version:application.version})});
      const result=await response.json();if(!response.ok){setError(result.error||"Kaydedilemedi.");return;}onSaved(result);
    }catch{setError("Sunucuya ulaşılamadı.");}finally{setBusy(false);}
  }
  return <article id={`basvuru-${application.id}`} className="scroll-mt-24 rounded-xl border-2 border-ink bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-display text-xs font-bold text-cyan-deep">PK-{String(application.id).padStart(4,"0")}</p><h2 className="mt-1 font-display text-xl font-bold">{application.name}</h2></div><span className="rounded bg-paper px-3 py-1 text-xs font-semibold">{application.status}</span></div>
    <p className="mt-3 text-sm text-ink/65">{application.city} / {application.district} · {application.occupation||"Rol belirtilmedi"}{application.organization?` · ${application.organization}`:""}</p>
    <p className="mt-2 break-all text-sm"><a href={`mailto:${application.email}`} className="text-cyan-deep underline">{application.email}</a>{application.phone&&<> · <a href={`tel:${application.phone}`} className="text-cyan-deep underline">{application.phone}</a></>}</p>
    <p className="mt-3 text-sm font-semibold">{application.areas.map(committeeAreaLabel).join(" · ")}</p>
    <p className="mt-1 text-sm text-ink/65">Uygunluk: {application.availability}</p>
    <p className="mt-4 text-xs font-bold text-ink/50">MOTİVASYON</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{application.motivation}</p>
    {application.experience&&<><p className="mt-4 text-xs font-bold text-ink/50">DENEYİM VE BECERİLER</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{application.experience}</p></>}
    <p className="mt-4 text-xs text-ink/50">Başvuru: {new Date(application.created_at).toLocaleString("tr-TR")} · Yetişkin katılım ve aydınlatma okuma bildirimi alındı.</p>
    <fieldset disabled={busy} className="mt-5 grid gap-4 border-t border-ink/15 pt-4 sm:grid-cols-[220px_1fr]">
      <label className="text-sm font-semibold">Durum<select className="mt-1 w-full rounded border border-ink/25 bg-paper p-2.5" value={status} onChange={event=>setStatus(event.target.value as CommitteeStatus)}>{COMMITTEE_STATUSES.map(option=><option key={option}>{option}</option>)}</select></label>
      <label className="text-sm font-semibold">Değerlendirme notu<textarea className="mt-1 w-full rounded border border-ink/25 bg-paper p-2.5 font-normal" rows={2} maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)}/><span className="mt-1 block text-xs font-normal text-ink/50">Yalnızca yetkili ekip görür.</span></label>
      {error&&<p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <button type="button" onClick={save} className="rounded bg-ink px-4 py-2.5 font-display text-xs font-bold text-white sm:col-start-2 sm:justify-self-start">{busy?"KAYDEDİLİYOR…":"DEĞERLENDİRMEYİ KAYDET"}</button>
    </fieldset>
  </article>;
}
export default function CommitteeApplicationsPage(){
  const [items,setItems]=useState<CommitteeApplication[]>([]),[cursor,setCursor]=useState<number|null>(null);
  const [search,setSearch]=useState(""),[query,setQuery]=useState(""),[status,setStatus]=useState("");
  const [loading,setLoading]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
  const pending=useRef<AbortController|null>(null);
  const load=useCallback(async(next?:number)=>{
    pending.current?.abort();const controller=new AbortController();pending.current=controller;
    setLoading(true);setError("");
    try{
      const parameters=new URLSearchParams({q:query,status});if(next)parameters.set("cursor",String(next));
      const response=await fetch(`/api/planning-committee?${parameters}`,{cache:"no-store",signal:controller.signal});const result=await response.json();
      if(controller.signal.aborted)return;
      if(response.status===401||response.status===403){setItems([]);setCursor(null);}
      if(!response.ok||!Array.isArray(result.items))throw new Error(result.error||"Başvurular alınamadı.");
      setItems(previous=>next?[...previous,...result.items]:result.items);setCursor(result.nextCursor);
    }catch(err){if(!controller.signal.aborted)setError(err instanceof Error?err.message:"Başvurular alınamadı.");}finally{if(!controller.signal.aborted)setLoading(false);}
  },[query,status]);
  useEffect(()=>{setItems([]);setCursor(null);void load();return()=>pending.current?.abort();},[load]);
  return <div className="max-w-6xl"><h1 className="font-display text-2xl font-bold">PLANLAMA KOMİTESİ BAŞVURULARI</h1><p className="mt-2 text-sm text-ink/55">Yetişkin gönüllü başvurularını incele, durumunu ve ekip içi notlarını güncelle.</p>
    <form onSubmit={event=>{event.preventDefault();setQuery(search);}} className="mt-5 flex flex-wrap gap-3"><input aria-label="Başvurularda ara" placeholder="Ad, e-posta, il veya kurum" maxLength={100} className="min-w-0 flex-1 rounded border border-ink/25 bg-white p-2.5" value={search} onChange={event=>setSearch(event.target.value)}/><select aria-label="Başvuru durumuna göre filtrele" className="rounded border border-ink/25 bg-white p-2.5" value={status} onChange={event=>setStatus(event.target.value)}><option value="">Tüm durumlar</option>{COMMITTEE_STATUSES.map(option=><option key={option}>{option}</option>)}</select><button disabled={loading} className="rounded bg-ink px-4 py-2 text-sm font-bold text-white">ARA</button><button type="button" disabled={loading} onClick={()=>load()} className="rounded border border-ink px-4 py-2 text-sm font-bold">YENİLE</button></form>
    {error&&<p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message&&<p role="status" className="mt-4 rounded bg-cyan-brand/10 p-3 text-sm">{message}</p>}
    <div className="mt-5 space-y-4">{items.map(application=><ApplicationCard key={application.id} application={application} onSaved={record=>{setItems(previous=>previous.flatMap(item=>item.id!==record.id?[item]:status&&status!==record.status?[]:[{...item,...record}]));setMessage(`PK-${String(record.id).padStart(4,"0")} değerlendirmesi kaydedildi.`);}}/>)}</div>
    {loading&&<p role="status" className="mt-5 text-sm">Başvurular yükleniyor…</p>}{!loading&&!error&&items.length===0&&<p className="mt-5 rounded border-2 border-dashed border-ink/20 p-8 text-center text-ink/50">Bu ölçütlere uygun başvuru bulunamadı.</p>}
    {cursor&&<button disabled={loading} onClick={()=>load(cursor)} className="mt-5 rounded border-2 border-ink px-5 py-3 font-display text-sm font-bold">DAHA FAZLA BAŞVURU</button>}
  </div>;
}
