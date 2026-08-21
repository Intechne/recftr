"use client";
import { useEffect, useState } from "react";
import { programs } from "@/lib/data";

type App = { id: number; num: string; team: string; org: string; city: string; program: string; kit: number; total: number; status: string; created_at: string };

export default function OnaylarAdmin() {
  const [apps, setApps] = useState<App[] | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const r = await fetch("/api/applications");
    if (r.ok) setApps(await r.json());
    else setErr("Liste yüklenemedi — oturumunun admin olduğundan emin ol.");
  };
  useEffect(() => { load(); }, []);

  const act = async (id: number, action: "approve" | "reject", num: string) => {
    const r = await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    if (r.ok) {
      setMsg(action === "approve" ? `✓ ${num} onaylandı — Takımlar sayfasında yayında.` : `${num} başvurusu reddedildi.`);
      load();
    } else setErr("İşlem başarısız.");
  };

  const code = (slug: string) => programs.find(p => p.slug === slug)?.code ?? slug.toUpperCase();

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-[24px] font-bold text-ink">TAKIM ONAYLARI</h1>
      <p className="text-[13.5px] text-ink/55">Yeni başvurular canlı veritabanından gelir; onaylanan takım anında /takimlar sayfasında görünür.</p>
      {msg && <p className="mt-4 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700">{msg}</p>}
      {err && <p className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-700">{err}</p>}

      {!apps && !err && <p className="mt-8 font-display text-[14px] font-semibold text-ink/40">Yükleniyor…</p>}
      {apps && apps.length === 0 && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-ink/25 bg-white/60 p-10 text-center">
          <p className="font-display text-[16px] font-bold text-ink/60">Bekleyen başvuru yok 🎉</p>
          <p className="mt-1 text-[13px] text-ink/45">Yeni başvurular /kayit formundan buraya düşer.</p>
        </div>
      )}

      <div className="mt-5 space-y-3.5">
        {apps?.map(a => (
          <div key={a.id} className="rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand/60">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-ink px-2.5 py-1 font-display text-[13px] font-bold tracking-[1.5px] text-cyan-brand">{a.num}</span>
              <span className="font-display text-[16px] font-bold text-ink">{a.team}</span>
              <span className="rounded bg-paper px-2 py-0.5 font-display text-[10.5px] font-bold text-ink/60">{code(a.program)}</span>
              <span className="ml-auto font-display text-[11px] font-semibold text-ink/40">#{String(a.id).padStart(4, "0")}</span>
            </div>
            <p className="mt-1.5 text-[13px] text-ink/60">{a.org} · {a.city} · {a.kit ? "Saha kiti dahil" : "Kit yok"} · <strong className="text-ink">₺{a.total.toLocaleString("tr-TR")}</strong></p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className={`rounded-md border px-2.5 py-1 font-display text-[10.5px] font-bold ${
                a.status.includes("DOĞRULANDI") ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-amber-600 bg-amber-100 text-amber-800"}`}>{a.status}</span>
              <button onClick={() => act(a.id, "approve", a.num)}
                className="plate-hover rounded-md bg-ink px-4 py-2 font-display text-[12px] font-bold text-white shadow-plateSm shadow-cyan-brand">ONAYLA ✓</button>
              <button onClick={() => act(a.id, "reject", a.num)}
                className="rounded-md border-2 border-red-500 px-4 py-2 font-display text-[12px] font-bold text-red-600 hover:bg-red-500 hover:text-white">REDDET</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
