export async function uploadFile(purpose:"media"|"document"|"team-doc"|"team-logo", file:File){
  const sign=await fetch("/api/uploads/sign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({purpose,fileName:file.name,mimeType:file.type,size:file.size})});
  const meta=await sign.json(); if(!sign.ok)throw new Error(meta.error||"Yükleme bağlantısı oluşturulamadı.");
  const form=new FormData(); form.append("cacheControl","3600"); form.append("",file);
  const up=await fetch(meta.signedUrl,{method:"PUT",headers:{"x-upsert":"false"},body:form});
  if(!up.ok)throw new Error(`Dosya yüklenemedi (${up.status}).`);
  return {...meta,mime_type:file.type,size_bytes:file.size,size_label:formatBytes(file.size)};
}
export function formatBytes(n:number){if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024/1024).toFixed(1)} MB`;}
