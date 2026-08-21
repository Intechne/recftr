"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function CmsForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, pass, scope: "cms" }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error ?? "Giriş başarısız."); return; }
    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : "/admin");
    router.refresh();
  };
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-white/20 bg-white/[.06] px-4 py-3.5 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-cyan-brand";

  return (
    <div className="w-full max-w-sm">
      <p className="font-display text-[15px] font-bold tracking-[2px] text-cyan-brand">⚙ RECF TÜRKİYE</p>
      <h1 className="mt-3 font-display text-[28px] font-bold text-white">İÇERİK YÖNETİM SİSTEMİ</h1>
      <p className="mt-2 text-[13.5px] text-white/50">Yalnızca yetkili ekip üyeleri. Tüm oturumlar kayıt altındadır.</p>
      <form onSubmit={login} className="mt-7">
        <label className="block font-display text-[11.5px] font-semibold tracking-[1px] text-white/60">KURUMSAL E-POSTA
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ad@recfturkiye.org" className={input} required />
        </label>
        <label className="mt-4 block font-display text-[11.5px] font-semibold tracking-[1px] text-white/60">ŞİFRE
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className={input} required />
        </label>
        {err && <p className="mt-3 rounded-md border border-red-400 bg-red-400/10 px-3.5 py-2.5 text-[13px] font-semibold text-red-300">{err}</p>}
        <button type="submit" disabled={busy}
          className="mt-6 w-full rounded-md bg-white/10 py-3.5 font-display text-[14px] font-bold text-cyan-brand ring-1 ring-cyan-brand transition-colors hover:bg-cyan-brand hover:text-ink disabled:opacity-50">
          {busy ? "DOĞRULANIYOR…" : "YÖNETİME GİR"}
        </button>
      </form>
    </div>
  );
}
export default function CmsGiris() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-5">
      <Suspense><CmsForm /></Suspense>
    </div>
  );
}
