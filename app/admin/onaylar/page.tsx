"use client";
import {useCallback,useEffect,useState} from "react";
type Application={id:number;num:string;team:string;org:string;city:string;district:string;mentor:string;email:string;phone:string;program:string;status:string;kvkk_accepted:boolean;approval_email_status:string;approval_email_sent_at:string|null;approval_email_attempted_at:string|null};
const emailLabels:Record<string,string>={pending:'Henüz gönderilmedi',sending:'Gönderim sürüyor',accepted:'Gönderim kabul edildi',failed:'Gönderilemedi',disabled:'E-posta gönderimi kapalı'};
const emailFeedback:Record<string,string>={accepted:'Onay e-postasının gönderimi kabul edildi.',failed:'Takım onaylandı; e-posta gönderilemedi. Onaylananlar bölümünden tekrar deneyin.',disabled:'Takım onaylandı; e-posta gönderimi kapalı. Yapılandırmayı kontrol edip tekrar deneyin.',sending:'E-posta gönderimi sürüyor. Birkaç dakika sonra listeyi yenileyin.',unavailable:'Onay e-postası için eşleşen aktif takım bulunamadı.'};
export default function Page(){
  const [apps,setApps]=useState<Application[]>([]),[msg,setMsg]=useState(''),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
  const [busy,setBusy]=useState<number|null>(null),[view,setView]=useState('pending'),[search,setSearch]=useState('');
  const load=useCallback(async()=>{
    setLoading(true);setLoadError('');
    try{const response=await fetch('/api/applications',{cache:'no-store'});const result=await response.json();if(!response.ok||!Array.isArray(result))throw new Error(result?.error||'Başvurular yüklenemedi.');setApps(result);}
    catch(error){setApps([]);setLoadError(error instanceof Error?error.message:'Başvurular yüklenemedi.');}finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load()},[load]);
  async function act(id:number,action:'approve'|'reject'|'approval-email'){
    setBusy(id);setMsg('');
    try{
      const response=await fetch(`/api/applications/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'İşlem tamamlanamadı.');
      if(action==='reject')setMsg(`${result.num} reddedildi.`);
      else if(action==='approval-email')setMsg(emailFeedback[result.approvalEmail]||'E-posta durumu güncellendi.');
      else setMsg(`✓ ${result.num} onaylandı. ${emailFeedback[result.approvalEmail]||''}${result.temporaryPassword?` Mentor geçici şifresi: ${result.temporaryPassword}`:' Mentor hesabı zaten vardı.'}`);
      await load();
    }catch(error){setMsg('Hata: '+(error instanceof Error?error.message:'Sunucuya ulaşılamadı.'));}finally{setBusy(null);}
  }
  const rows=apps.filter(app=>(view==='approved'?app.status==='ONAYLANDI':app.status!=='ONAYLANDI'&&app.status!=='REDDEDİLDİ')&&`${app.num} ${app.team} ${app.org} ${app.mentor} ${app.email}`.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')));
  return <div className="max-w-6xl">
    <h1 className="font-display text-[25px] font-bold">TAKIM BAŞVURULARI</h1>
    <p className="mt-1 text-[13px] text-ink/55">Onaylanan başvuru takım kaydına dönüşür; mentöre onay ve sonraki adımlar e-postası otomatik gönderilir.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <select aria-label="Başvuru görünümü" className="rounded border border-ink/25 bg-white px-3 py-2.5 text-sm" value={view} onChange={event=>setView(event.target.value)}><option value="pending">Bekleyen başvurular</option><option value="approved">Onaylananlar ve e-posta durumu</option></select>
      <input aria-label="Takım başvurularında ara" placeholder="Takım, kurum veya mentör ara" value={search} onChange={event=>setSearch(event.target.value)} className="min-w-0 flex-1 rounded border border-ink/25 bg-white px-3 py-2.5 text-sm"/>
      <button type="button" onClick={()=>void load()} disabled={loading||busy!==null} className="rounded border border-ink px-4 py-2 text-sm font-bold disabled:opacity-50">YENİLE</button>
    </div>
    {view==='approved'&&<p className="mt-3 text-xs leading-relaxed text-ink/55">Gönderim kabul edildi: e-posta sağlayıcısı mesajı aldı; teslim durumu Resend üzerinden izlenir. Önceden onaylanmış ve e-posta gönderilmemiş takımlar için gönderimi buradan başlatabilirsiniz.</p>}
    {loadError&&<p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{loadError} <button onClick={()=>void load()} className="font-bold underline">TEKRAR DENE</button></p>}
    {loading&&<p role="status" className="mt-4 text-sm text-ink/55">Başvurular yükleniyor…</p>}
    {msg&&<p role="status" className="mt-4 break-words rounded-lg border-2 border-amber-500 bg-amber-50 p-3 text-[13px] font-semibold text-amber-900">{msg}</p>}
    <div className="mt-5 space-y-3">{rows.map(app=>{
      const stale=app.approval_email_status==='sending'&&!!app.approval_email_attempted_at&&Date.now()-new Date(app.approval_email_attempted_at).getTime()>300000;
      const sent=app.approval_email_status==='accepted'||!!app.approval_email_sent_at;
      return <article id={`basvuru-${app.id}`} key={app.id} className="scroll-mt-24 rounded-xl border-2 border-ink bg-white p-5">
        <div className="flex flex-wrap items-center gap-3"><span className="rounded bg-ink px-3 py-1 font-display font-bold text-cyan-brand">{app.num}</span><h2 className="font-display text-[16px] font-bold">{app.team}</h2><span className="text-[12px] text-ink/50">{app.program}</span></div>
        <p className="mt-2 break-words text-[13px] text-ink/60">{app.org} · {app.city}{app.district?` / ${app.district}`:''} · Mentör: {app.mentor} · {app.email} · {app.phone}</p>
        <p className="mt-1 text-[13px]">{app.status} · Aydınlatma: {app.kvkk_accepted?'OKUMA BİLDİRİMİ ALINDI':'—'}</p>
        {view==='approved'?<div className="mt-4 border-t border-ink/10 pt-3"><p className="text-sm font-semibold">Onay e-postası: {emailLabels[app.approval_email_status]||emailLabels.pending}{app.approval_email_sent_at?` · ${new Date(app.approval_email_sent_at).toLocaleString('tr-TR')}`:''}</p>
          {!sent&&<button disabled={busy!==null||(app.approval_email_status==='sending'&&!stale)} onClick={()=>void act(app.id,'approval-email')} className="mt-3 rounded bg-ink px-4 py-2 font-display text-xs font-bold text-white disabled:opacity-50">{busy===app.id?'GÖNDERİLİYOR…':app.approval_email_status==='pending'?'ONAY E-POSTASI GÖNDER':'GÖNDERİMİ TEKRAR DENE'}</button>}
        </div>:<div className="mt-4 flex gap-2"><button disabled={busy!==null} onClick={()=>void act(app.id,'approve')} className="rounded bg-ink px-4 py-2 font-display text-[12px] font-bold text-white disabled:opacity-50">{busy===app.id?'İŞLENİYOR…':'ONAYLA'}</button><button disabled={busy!==null} onClick={()=>void act(app.id,'reject')} className="rounded border-2 border-red-500 px-4 py-2 font-display text-[12px] font-bold text-red-600 disabled:opacity-50">REDDET</button></div>}
      </article>;
    })}{!loading&&!loadError&&rows.length===0&&<div className="rounded-xl border-2 border-dashed border-ink/20 p-10 text-center text-ink/50">{view==='approved'?'Bu ölçütlere uygun onaylı başvuru yok.':'Bu ölçütlere uygun bekleyen başvuru yok.'}</div>}</div>
  </div>;
}
