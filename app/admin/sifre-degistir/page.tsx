"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const result = await response.json();
      if (!response.ok) return setMessage(result.error || "Şifre değiştirilemedi.");
      setCurrent("");setNext("");
      router.replace("/cms-giris?password=changed");
      router.refresh();
    } catch {
      setMessage("Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="max-w-md rounded-xl border-2 border-ink bg-white p-6">
    <h1 className="font-display text-2xl font-bold">ŞİFRE DEĞİŞTİR</h1>
    <p className="mt-2 text-sm">Devam etmek için geçici şifrenizi değiştirin.</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label className="block text-sm">Mevcut şifre<input type="password" autoComplete="current-password" required value={current} onChange={e => setCurrent(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <label className="block text-sm">Yeni şifre<input type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={next} onChange={e => setNext(e.target.value)} className="mt-1 w-full rounded border p-2" /><span className="mt-1 block text-xs text-ink/60">En az 12 karakter; mevcut şifrenizden farklı olmalı.</span></label>
      {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
      <button disabled={busy} className="rounded bg-ink px-4 py-2 font-bold text-white">{busy ? "Kaydediliyor…" : "Şifreyi değiştir"}</button>
    </form>
  </div>;
}
