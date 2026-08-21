"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function GirisForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (e?: React.FormEvent, quickE?: string, quickP?: string) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    const body = { email: quickE ?? email, pass: quickP ?? pass };
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error ?? "Giriş başarısız."); return; }
    const { role } = await r.json();
    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : role === "admin" ? "/admin" : "/portal");
    router.refresh();
  };

  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-white/25 bg-white/[.07] px-4 py-3.5 text-[15px] text-white placeholder:text-white/40 outline-none focus:border-cyan-brand";

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="font-display text-[22px] font-bold text-cyan-brand">⬡ RECF TÜRKİYE</Link>
      <h1 className="mt-6 font-display text-[34px] font-bold text-white">SİSTEME GİRİŞ</h1>
      <p className="mt-2 text-[14.5px] text-white/60">Takım Portalı ve İçerik Yönetim Sistemi için tek oturum.</p>

      <form onSubmit={login} className="mt-8">
        <label className="block font-display text-[12px] font-semibold tracking-[1px] text-white/70">E-POSTA
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mentor@takimin.org" className={input} required />
        </label>
        <label className="mt-4 block font-display text-[12px] font-semibold tracking-[1px] text-white/70">ŞİFRE
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className={input} required />
        </label>
        {err && <p className="mt-3 rounded-md border border-red-400 bg-red-400/10 px-3.5 py-2.5 text-[13.5px] font-semibold text-red-300">{err}</p>}
        <button type="submit" disabled={busy}
          className="plate-hover mt-6 w-full rounded-md bg-cyan-brand py-4 font-display text-[15px] font-bold text-ink shadow-plateSm shadow-white/25 disabled:opacity-50">
          {busy ? "GİRİLİYOR…" : "GİRİŞ YAP"}
        </button>
      </form>

      {process.env.NODE_ENV !== "production" && <div className="mt-8 rounded-xl border border-white/15 bg-white/[.05] p-5">
        <p className="font-display text-[12px] font-semibold tracking-[1.5px] text-cyan-brand">DEMO HESAPLAR</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <button onClick={() => login(undefined, "mentor@voltran.org", "905a")}
            className="rounded-md border-[1.5px] border-white/25 px-3.5 py-3 text-left transition-colors hover:border-cyan-brand">
            <span className="block font-display text-[13px] font-bold text-white">🖥 TAKIM PORTALI</span>
            <span className="block text-[12px] text-white/50">mentor@voltran.org · 905a</span>
          </button>
          <button onClick={() => login(undefined, "admin@recfturkiye.org", "recf2026")}
            className="rounded-md border-[1.5px] border-white/25 px-3.5 py-3 text-left transition-colors hover:border-cyan-brand">
            <span className="block font-display text-[13px] font-bold text-white">⚙️ CMS / YÖNETİM</span>
            <span className="block text-[12px] text-white/50">admin@recfturkiye.org · recf2026</span>
          </button>
        </div>
      </div>}
      <p className="mt-6 text-[12.5px] text-white/40">Şifreni mi unuttun? takim@recfturkiye.org · Kaydın yok mu? <Link href="/kayit" className="text-cyan-brand underline">Takım kaydı</Link></p>
    </div>
  );
}

export default function GirisPage() {
  return (
    <div className="field-grid-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-12">
      <div aria-hidden className="absolute -left-24 -top-24 h-56 w-56 rotate-45 bg-alliance-red/80" />
      <div aria-hidden className="absolute -bottom-24 -right-24 h-56 w-56 rotate-45 bg-alliance-blue/80" />
      <Suspense><GirisForm /></Suspense>
    </div>
  );
}
