"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html><body><main style={{fontFamily:"system-ui",padding:"64px 24px",maxWidth:720,margin:"0 auto",textAlign:"center"}}><h1>RECF Türkiye</h1><p>Uygulama yüklenirken beklenmeyen bir hata oluştu.</p><button onClick={reset} style={{padding:"10px 16px",cursor:"pointer"}}>Yeniden dene</button></main></body></html>;
}
