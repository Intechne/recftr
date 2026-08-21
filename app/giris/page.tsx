"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {FigmaIcon} from "@/components/FigmaIcon";

function GirisForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, pass, scope: "portal" }) });
    setBusy(false);
    if (!r.ok) { setErr((await r.json()).error ?? "Giriş başarısız."); return; }
    const { role } = await r.json();
    const next = params.get("next");
    router.push(next && next.startsWith("/") ? next : role === "admin" ? "/admin" : "/portal");
    router.refresh();
  };
  const input = "mt-1.5 w-full rounded-md border-[1.5px] border-white/25 bg-white/[.07] px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none focus:border-cyan-brand";

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 font-display text-[19px] font-bold text-cyan-brand sm:text-[22px]"><FigmaIcon name="robot" className="h-6 w-6"/> RECF TÜRKİYE</Link>
      <h1 className="mt-6 font-display text-[30px] font-bold text-white sm:text-[34px] 2xl:text-[40px]">TAKIM PORTALI</h1>
      <p className="mt-2 text-[14.5px] text-white/60">Mentor hesabınla giriş yap — üyeler, belgeler, etkinlik kayıtları ve ödemeler.</p>
      <form onSubmit={login} className="mt-8">
        <label className="block font-display text-[12px] font-semibold tracking-[1px] text-white/70">MENTOR E-POSTA
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mentor@okulunuz.org" className={input} required />
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
      <p className="mt-6 text-[12.5px] text-white/40">
        Şifreni mi unuttun? <span className="text-white/60">takim@recfturkiye.org</span> · Takımın yok mu? <Link href="/kayit" className="text-cyan-brand underline">Takım kaydı</Link>
      </p>
    </div>
  );
}
export default function GirisPage() {
  return (
    <div className="field-grid-dark safe-x relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-ink py-10 sm:py-12">
      <div aria-hidden className="absolute -left-24 -top-24 h-56 w-56 rotate-45 bg-alliance-red/80" />
      <div aria-hidden className="absolute -bottom-24 -right-24 h-56 w-56 rotate-45 bg-alliance-blue/80" />
      <Suspense><GirisForm /></Suspense>
    </div>
  );
}
