"use client";
import {useCallback,useEffect,useState} from "react";

type Contact={id:number;name:string;email:string;phone:string;subject:string;message:string;status:string};
export default function Page(){
  const [list,setList]=useState<Contact[]|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true),[updating,setUpdating]=useState<number|null>(null);
  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try{const response=await fetch('/api/contact',{cache:'no-store'});const body=await response.json();if(!response.ok||!Array.isArray(body))throw new Error(body?.error||'Mesajlar yüklenemedi.');setList(body);}
    catch(error){setList(null);setError(error instanceof Error?error.message:'Mesajlar yüklenemedi.');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load()},[load]);
  async function status(id:number,status:string){
    if(updating!==null)return;
    setUpdating(id);setError("");
    try{const response=await fetch('/api/contact',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});const body=await response.json();if(!response.ok)throw new Error(body?.error||'Mesaj durumu kaydedilemedi.');await load();}
    catch(error){setError(error instanceof Error?error.message:'Mesaj durumu kaydedilemedi.');}
    finally{setUpdating(null);}
  }
  return <div className="max-w-6xl"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-[25px] font-bold">İLETİŞİM KUTUSU</h1><p className="text-[13px] text-ink/55">Sitedeki iletişim formundan kaydedilen mesajlar.</p></div><button disabled={loading} onClick={load} className="rounded bg-ink px-4 py-2 text-xs font-bold text-white disabled:opacity-50">YENİLE</button></div>
    {error&&<p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    {loading&&<p role="status" className="mt-5 text-sm text-ink/55">Mesajlar yükleniyor…</p>}
    {!loading&&list?.length===0&&<p className="mt-5 rounded-xl border-2 border-dashed border-ink/20 p-8 text-center text-ink/50">Henüz iletişim mesajı yok.</p>}
    <div className="mt-5 space-y-3">{list?.map(message=><div id={`mesaj-${message.id}`} key={message.id} className={`scroll-mt-24 rounded-xl border-2 bg-white p-5 ${message.status==='YENİ'?'border-cyan-deep':'border-ink/15'}`}><div className="flex flex-wrap items-center gap-3"><b>{message.name}</b><a className="text-cyan-deep" href={`mailto:${message.email}`}>{message.email}</a><span className="text-[12px] text-ink/45">{message.phone}</span><span className="ml-auto text-[11px] font-bold">#{message.id} · {message.status}</span></div><p className="mt-2 font-semibold">{message.subject}</p><p className="mt-2 whitespace-pre-wrap text-[13px] text-ink/65">{message.message}</p><div className="mt-3 flex gap-2"><button disabled={updating!==null} onClick={()=>status(message.id,'OKUNDU')} className="rounded border border-ink/20 px-3 py-1.5 text-[11px] font-bold disabled:opacity-50">OKUNDU</button><button disabled={updating!==null} onClick={()=>status(message.id,'CEVAPLANDI')} className="rounded bg-ink px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">CEVAPLANDI</button></div></div>)}</div>
  </div>;
}
