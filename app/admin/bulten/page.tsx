"use client";
import {useEffect,useState} from "react";
type Sub={id:number;email:string;consent_text:string;consent_at:string;source:string;status:"AKTİF"|"AYRILDI";unsubscribed_at:string|null};
export default function Page(){
  const [items,setItems]=useState<Sub[]>([]),[msg,setMsg]=useState(""),[pending,setPending]=useState(false),[q,setQ]=useState("");
  const load=async()=>{try{const r=await fetch("/api/newsletter",{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);setItems(Array.isArray(j.items)?j.items:[]);setPending(!!j.migrationPending);}catch(e:any){setMsg("Hata: "+(e.message||"Liste alınamadı."));}};
  useEffect(()=>{void load()},[]);
  async function toggle(sub:Sub){const next=sub.status==="AKTİF"?"AYRILDI":"AKTİF";const r=await fetch("/api/newsletter",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:sub.id,status:next})});const j=await r.json();if(!r.ok)return setMsg("Hata: "+(j.error||"Güncellenemedi."));setItems(list=>list.map(x=>x.id===sub.id?{...x,status:next,unsubscribed_at:next==="AYRILDI"?new Date().toISOString():null}:x));}
  function exportCsv(){const active=items.filter(x=>x.status==="AKTİF");const csv=["email,consent_at,source",...active.map(x=>`${x.email},${x.consent_at},${x.source}`)].join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`recf-bulten-aktif-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);}
  const rows=items.filter(x=>x.email.includes(q.toLowerCase()));
  return <div className="max-w-6xl">
    <h1 className="font-display text-[25px] font-bold">BÜLTEN ABONELERİ</h1>
    <p className="mt-1 text-[13px] text-ink/55">Footer bülten formundan açık rızayla kaydolan adresler. Rıza metni ve zamanı kayıtla birlikte saklanır. Rızasını geri alan kişiyi “AYRILDI” olarak işaretleyin; dışa aktarım yalnız aktif aboneleri içerir.</p>
    {pending&&<p role="status" className="mt-4 rounded-lg border-2 border-amber-500 bg-amber-50 p-3 text-[13px] font-semibold text-amber-900">Veritabanı güncellemesi (migration) henüz uygulanmadı.</p>}
    {msg&&<p role="status" className="mt-4 rounded-lg bg-red-50 p-3 text-[13px] font-semibold text-red-700">{msg}</p>}
    <div className="mt-5 flex flex-wrap gap-3"><input aria-label="E-posta ara" placeholder="E-posta ara" value={q} onChange={e=>setQ(e.target.value)} className="min-w-0 flex-1 rounded border border-ink/25 bg-white px-3 py-2.5 text-sm"/><button onClick={exportCsv} disabled={!items.some(x=>x.status==="AKTİF")} className="rounded bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-40">AKTİFLERİ CSV İNDİR</button></div>
    <p className="mt-3 text-[12px] text-ink/55">{items.filter(x=>x.status==="AKTİF").length} aktif · {items.length} toplam</p>
    <div className="mt-3 table-scroll rounded-xl border border-ink/15 bg-white"><table className="w-full min-w-[720px] text-left text-[13px]"><thead className="bg-ink text-white"><tr>{["E-POSTA","RIZA TARİHİ","KAYNAK","DURUM",""].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.id} className="border-t border-ink/10"><td className="px-4 py-3 break-all">{x.email}</td><td className="px-4">{new Date(x.consent_at).toLocaleString("tr-TR")}</td><td className="px-4">{x.source}</td><td className="px-4 font-bold">{x.status}</td><td className="px-4"><button onClick={()=>void toggle(x)} className="font-bold text-cyan-deep">{x.status==="AKTİF"?"AYRILDI OLARAK İŞARETLE":"YENİDEN AKTİF ET"}</button></td></tr>)}</tbody></table></div>
  </div>;
}
