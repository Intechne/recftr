export async function uploadFile(purpose:"media"|"document"|"team-doc"|"team-logo", file:File){
  const sign=await fetch("/api/uploads/sign",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"same-origin",
    body:JSON.stringify({purpose,fileName:file.name,mimeType:file.type,size:file.size})
  });
  const signText=await sign.text();
  let meta:any={};
  try{meta=signText?JSON.parse(signText):{}}catch{meta={error:signText||"Geçersiz sunucu cevabı"}}
  if(!sign.ok)throw new Error(meta.error||`Yükleme bağlantısı oluşturulamadı (${sign.status}).`);
  if(!meta.signedUrl)throw new Error("Sunucu imzalı yükleme bağlantısı döndürmedi.");

  const form=new FormData();
  form.append("cacheControl","3600");
  form.append("",file);
  let up:Response;
  try{
    up=await fetch(meta.signedUrl,{method:"PUT",headers:{"x-upsert":"false"},body:form});
  }catch(e:any){
    throw new Error(`Supabase Storage'a erişilemedi: ${e?.message||"ağ/CORS hatası"}`);
  }
  if(!up.ok){
    const text=await up.text().catch(()=>"");
    let detail=text;
    try{const j=JSON.parse(text); detail=j?.message||j?.error||j?.statusCode||text}catch{}
    throw new Error(`Dosya yüklenemedi (${up.status})${detail?`: ${detail}`:""}`);
  }
  return {...meta,mime_type:file.type,size_bytes:file.size,size_label:formatBytes(file.size)};
}
export function formatBytes(n:number){if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024/1024).toFixed(1)} MB`;}
