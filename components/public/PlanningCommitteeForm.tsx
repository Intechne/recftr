"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {COMMITTEE_AREAS,COMMITTEE_AVAILABILITIES} from "@/lib/planning-committee";
import {PUBLIC_CONTACT} from "@/lib/public-contact";

export default function PlanningCommitteeForm({provinces}:{provinces:string[]}){
  const [form,setForm]=useState({name:"",email:"",phone:"",city:"",district:"",organization:"",occupation:"",areas:[] as string[],availability:"",experience:"",motivation:"",adult:false,kvkk:false,website:""});
  const [districts,setDistricts]=useState<string[]>([]),[districtLoading,setDistrictLoading]=useState(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const [result,setResult]=useState<{id:number;confirmationEmail:string}|null>(null);
  const submissionKey=useRef("");
  const set=<K extends keyof typeof form>(key:K,value:typeof form[K])=>{submissionKey.current="";setForm(previous=>({...previous,[key]:value}));};
  useEffect(()=>{
    if(!form.city){setDistricts([]);setDistrictLoading(false);return;}
    const controller=new AbortController();setDistricts([]);setDistrictLoading(true);
    fetch(`/api/locations?province=${encodeURIComponent(form.city)}`,{signal:controller.signal,cache:"force-cache"})
      .then(async response=>{const data=await response.json();if(!response.ok||!Array.isArray(data.districts))throw new Error("Location unavailable");setDistricts(data.districts);})
      .catch(()=>{if(!controller.signal.aborted)setDistricts([]);})
      .finally(()=>{if(!controller.signal.aborted)setDistrictLoading(false);});
    return()=>controller.abort();
  },[form.city]);
  const input="mt-1.5 w-full rounded-md border-[1.5px] border-ink/25 bg-paper px-3.5 py-3 text-sm outline-none focus:border-cyan-deep disabled:opacity-50";
  const label="block font-display text-[13px] font-semibold text-ink";
  async function submit(event:React.FormEvent){
    event.preventDefault();setError("");
    if(form.areas.length<1||form.areas.length>3){setError("Bir ile üç arasında katkı alanı seçin.");return;}
    setBusy(true);
    try{
      if(!submissionKey.current)submissionKey.current=crypto.randomUUID();
      const response=await fetch("/api/planning-committee",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,submissionKey:submissionKey.current})});
      const data=await response.json();
      if(!response.ok){setError(data.error||"Başvuru kaydedilemedi.");return;}
      if(!Number.isSafeInteger(data.id)||data.id<1){setError("Başvuru sonucu doğrulanamadı. Tekrar göndermeden önce ekibimizle iletişime geçin.");return;}
      setResult({id:data.id,confirmationEmail:data.confirmationEmail});
    }catch{setError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.");}
    finally{setBusy(false);}
  }
  if(result)return <div role="status" className="rounded-xl border-2 border-ink bg-white p-6 sm:p-8"><p className="font-display text-xs font-bold tracking-[2px] text-cyan-deep">PLANLAMA KOMİTESİ</p><h3 className="mt-3 font-display text-2xl font-bold">BAŞVURUN ALINDI.</h3><p className="mt-4 rounded border-l-4 border-cyan-brand bg-cyan-brand/10 p-4 font-display font-bold">Başvuru numaran: PK-{String(result.id).padStart(4,"0")}</p><p className="mt-4 text-sm leading-relaxed text-ink/65">Ekibimiz katkı alanlarını ve uygunluğunu inceleyerek <strong>{form.email}</strong> üzerinden seninle iletişime geçecek. Görev paylaşımı ve çalışma biçimi görüşmede birlikte netleştirilecek.</p><p className="mt-3 text-sm leading-relaxed text-ink/65">{result.confirmationEmail==="accepted"?"Alındı bilgilendirmesini e-postanda kontrol edebilirsin; gelen kutusunda görünmüyorsa spam klasörüne de bak.":"Başvurun kaydedildi. Otomatik e-posta şu anda iletilemedi; başvuru numaranı saklayabilirsin."}</p><a href={`mailto:${PUBLIC_CONTACT.events}`} className="mt-5 inline-block font-semibold text-cyan-deep underline">{PUBLIC_CONTACT.events}</a></div>;
  return <form onSubmit={submit} aria-busy={busy} className="rounded-xl border-2 border-ink bg-white p-5 sm:p-7">
    <fieldset disabled={busy} className="space-y-6">
      <legend className="font-display text-xl font-bold">GÖNÜLLÜ BAŞVURUSU</legend>
      <p className="text-sm leading-relaxed text-ink/60">Yetişkin gönüllüler için. Yıldızlı alanlar zorunludur; katkı alanlarını ve uygunluğunu birlikte değerlendireceğiz.</p>
      <input name="website" aria-hidden="true" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px] h-px w-px opacity-0" value={form.website} onChange={event=>set("website",event.target.value)}/>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Ad Soyad*<input required maxLength={120} autoComplete="name" className={input} value={form.name} onChange={event=>set("name",event.target.value)}/></label>
        <label className={label}>E-posta*<input required type="email" maxLength={254} autoComplete="email" className={input} value={form.email} onChange={event=>set("email",event.target.value)}/></label>
        <label className={label}>Telefon<input type="tel" maxLength={40} autoComplete="tel" className={input} value={form.phone} onChange={event=>set("phone",event.target.value)}/><span className="mt-1 block text-xs font-normal text-ink/50">İsteğe bağlı.</span></label>
        <label className={label}>Meslek / Rol<input maxLength={120} placeholder="Örn. öğretmen, mentör, mühendis" className={input} value={form.occupation} onChange={event=>set("occupation",event.target.value)}/></label>
        <label className={label}>İl*<select required className={input} value={form.city} onChange={event=>{set("city",event.target.value);setForm(previous=>({...previous,district:""}));}}><option value="">İl seçin</option>{provinces.map(province=><option key={province}>{province}</option>)}</select></label>
        <label className={label}>İlçe*<select required disabled={!form.city||districtLoading} className={input} value={form.district} onChange={event=>set("district",event.target.value)}><option value="">{!form.city?"Önce il seçin":districtLoading?"İlçeler yükleniyor…":"İlçe seçin"}</option>{districts.map(district=><option key={district}>{district}</option>)}</select></label>
        <label className={`${label} sm:col-span-2`}>Kurum / Okul / Topluluk<input maxLength={160} className={input} value={form.organization} onChange={event=>set("organization",event.target.value)}/><span className="mt-1 block text-xs font-normal text-ink/50">Bağımsız katılıyorsan boş bırakabilirsin.</span></label>
      </div>
      <fieldset className="rounded-lg border border-ink/20 p-4"><legend className="px-1 font-display text-sm font-semibold">Katkı alanların* <span className="font-normal text-ink/50">(en fazla 3)</span></legend><div className="grid gap-3 sm:grid-cols-2">{COMMITTEE_AREAS.map(area=><label key={area.id} className="flex items-start gap-2.5 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-cyan-deep" checked={form.areas.includes(area.id)} disabled={!form.areas.includes(area.id)&&form.areas.length>=3} onChange={event=>set("areas",event.target.checked?[...form.areas,area.id]:form.areas.filter(id=>id!==area.id))}/><span>{area.label}</span></label>)}</div></fieldset>
      <label className={label}>Katılım uygunluğun*<select required className={input} value={form.availability} onChange={event=>set("availability",event.target.value)}><option value="">Uygunluğunu seç</option>{COMMITTEE_AVAILABILITIES.map(option=><option key={option}>{option}</option>)}</select></label>
      <label className={label}>Deneyimin ve becerilerin<textarea rows={3} maxLength={2000} className={input} placeholder="Etkinlik, eğitim, teknik hazırlık veya gönüllülük deneyimlerini paylaşabilirsin." value={form.experience} onChange={event=>set("experience",event.target.value)}/></label>
      <label className={label}>Komiteye nasıl katkı sunmak istersin?*<textarea required rows={4} maxLength={2000} className={input} value={form.motivation} onChange={event=>set("motivation",event.target.value)}/></label>
      <div className="space-y-3 border-t border-ink/15 pt-5">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-0.5 h-4 w-4 accent-cyan-deep" checked={form.adult} onChange={event=>set("adult",event.target.checked)}/><span>Yetişkin bir gönüllü olarak başvuruyorum.*</span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-0.5 h-4 w-4 accent-cyan-deep" checked={form.kvkk} onChange={event=>set("kvkk",event.target.checked)}/><span><Link href="/kvkk" target="_blank" className="font-semibold text-cyan-deep underline">KVKK Aydınlatma Metni</Link>’ni okudum ve bilgi edindim.*</span></label>
        <p className="text-xs leading-relaxed text-ink/50">Bilgilerin komite başvurunun incelenmesi ve seninle iletişime geçilmesi için alınır; başvurunu yetkili RECF Türkiye ekibi değerlendirir. <Link href="/hukuki-belgeler" target="_blank" className="text-cyan-deep underline">Hukuki belgeleri incele.</Link></p>
      </div>
      {error&&<p role="alert" className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold text-white shadow-plateSm shadow-cyan-brand disabled:opacity-50">{busy?"BAŞVURU GÖNDERİLİYOR…":"KOMİTEYE BAŞVUR →"}</button>
    </fieldset>
  </form>;
}
