"use client";
import {useCallback,useEffect,useState} from "react";
import {LEAD_CONFIG,LEAD_KINDS,LEAD_STATUSES,leadReference,type LeadKindId} from "@/lib/leads";

type Lead={id:number;kind:LeadKindId;name:string;email:string;phone:string;organization:string;role:string;city:string;message:string;details:Record<string,string|string[]>;status:string;review_notes:string;version:number;created_at:string};
const CHOICE_LABELS=Object.fromEntries(LEAD_KINDS.flatMap(kind=>LEAD_CONFIG[kind].choices.map(c=>[c.field,c.label])));

export default function Page(){
  const [items,setItems]=useState<Lead[]>([]),[kind,setKind]=useState(""),[status,setStatus]=useState(""),[msg,setMsg]=useState(""),[loading,setLoading]=useState(true),[pending,setPending]=useState(false);
  const [notes,setNotes]=useState<Record<number,string>>({}),[busy,setBusy]=useState<number|null>(null);
  const load=useCallback(async()=>{setLoading(true);setMsg("");try{const q=new URLSearchParams();if(kind)q.set("kind",kind);if(status)q.set("status",status);const r=await fetch(`/api/leads?${q}`,{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);setItems(Array.isArray(j.items)?j.items:[]);setPending(!!j.migrationPending);}catch(e:any){setItems([]);setMsg("Hata: "+(e.message||"Talepler alınamadı."));}finally{setLoading(false);}},[kind,status]);
  useEffect(()=>{void load()},[load]);
  async function update(lead:Lead,next:string){setBusy(lead.id);setMsg("");try{const r=await fetch(`/api/leads/${lead.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next,notes:notes[lead.id]??lead.review_notes,version:lead.version})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Güncellenemedi.");setItems(list=>list.map(x=>x.id===lead.id?{...x,...j}:x));setMsg(`Başarılı: ${leadReference(lead.kind,lead.id)} güncellendi.`);}catch(e:any){setMsg("Hata: "+e.message);}finally{setBusy(null);}}
  const sel="rounded border border-ink/25 bg-white px-3 py-2.5 text-sm";
  return <div className="max-w-6xl">
    <h1 className="font-display text-[25px] font-bold">TALEPLER</h1>
    <p className="mt-1 text-[13px] text-ink/55">Okul randevuları, destek randevuları, iş birliği ve lansman katılım formları. Yeni taleplerde ekibe kişisel veri içermeyen e-posta bildirimi gider.</p>
    {pending&&<p role="status" className="mt-4 rounded-lg border-2 border-amber-500 bg-amber-50 p-3 text-[13px] font-semibold text-amber-900">Veritabanı güncellemesi (migration) henüz uygulanmadı; formlar ziyaretçiye “çok yakında” mesajı gösteriyor.</p>}
    <div className="mt-5 flex flex-wrap gap-3"><select aria-label="Form türü" className={sel} value={kind} onChange={e=>setKind(e.target.value)}><option value="">Tüm formlar</option>{LEAD_KINDS.map(k=><option key={k} value={k}>{LEAD_CONFIG[k].label}</option>)}</select><select aria-label="Durum" className={sel} value={status} onChange={e=>setStatus(e.target.value)}><option value="">Tüm durumlar</option>{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</select><button onClick={()=>void load()} className="rounded border border-ink px-4 py-2 text-sm font-bold">YENİLE</button></div>
    {msg&&<p role="status" className={`mt-4 rounded-lg p-3 text-[13px] font-semibold ${msg.startsWith("Hata")?"bg-red-50 text-red-700":"bg-cyan-deep/10 text-cyan-deep"}`}>{msg}</p>}
    {loading&&<p role="status" className="mt-4 text-sm text-ink/55">Yükleniyor…</p>}
    <div className="mt-5 space-y-3">{items.map(lead=><article id={`talep-${lead.id}`} key={lead.id} className="scroll-mt-24 rounded-xl border-2 border-ink bg-white p-5">
      <div className="flex flex-wrap items-center gap-3"><span className="rounded bg-ink px-3 py-1 font-display text-sm font-bold text-cyan-brand">{leadReference(lead.kind,lead.id)}</span><h2 className="font-display text-[16px] font-bold">{LEAD_CONFIG[lead.kind]?.label}</h2><span className="text-[12px] text-ink/50">{new Date(lead.created_at).toLocaleString("tr-TR")}</span><span className="ml-auto rounded border border-ink/20 px-2 py-1 text-[11px] font-bold">{lead.status}</span></div>
      <p className="mt-2 break-words text-[13px] text-ink/70"><b>{lead.name}</b> · <a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a>{lead.phone&&` · ${lead.phone}`}{lead.organization&&` · ${lead.organization}`}{lead.role&&` · ${lead.role}`}{lead.city&&` · ${lead.city}`}</p>
      {Object.entries(lead.details||{}).filter(([,v])=>Array.isArray(v)?v.length:v).map(([k,v])=><p key={k} className="mt-1 text-[13px]"><b>{CHOICE_LABELS[k]||k}:</b> {Array.isArray(v)?v.join(", "):v}</p>)}
      {lead.message&&<p className="mt-2 whitespace-pre-wrap break-words rounded bg-paper p-3 text-[13px] text-ink/75">{lead.message}</p>}
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-[11px] font-bold">İÇ NOT<textarea rows={2} maxLength={2000} className="mt-1 w-full rounded border border-ink/20 px-3 py-2 text-[13px]" value={notes[lead.id]??lead.review_notes} onChange={e=>setNotes(n=>({...n,[lead.id]:e.target.value}))}/></label><select aria-label="Durumu güncelle" disabled={busy!==null} className={sel} value={lead.status} onChange={e=>void update(lead,e.target.value)}>{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
    </article>)}{!loading&&items.length===0&&<div className="rounded-xl border-2 border-dashed border-ink/20 p-10 text-center text-ink/50">Bu ölçütlere uygun talep yok.</div>}</div>
  </div>;
}
