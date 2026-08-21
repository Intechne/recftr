"use client";
import { useEffect, useState } from "react";

type M = { id: number; name: string; role: string; cat: string; consent: string; status: string };

export default function UyelerPage() {
  const [members, setMembers] = useState<M[] | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const r = await fetch("/api/members");
    if (r.ok) setMembers(await r.json());
  };
  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email.includes("@")) { setMsg("Geçerli bir e-posta gir."); return; }
    const r = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    if (r.ok) { setMsg(`✓ Davet gönderildi: ${email}`); setEmail(""); load(); }
    else setMsg("Davet gönderilemedi.");
  };

  const active = members?.filter(m => m.status === "AKTİF") ?? [];
  const pending = members?.filter(m => m.status !== "AKTİF") ?? [];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">TAKIM ÜYELERİ</h1>
          <p className="mt-1 text-[14.5px] text-ink/60">905A kadrosu — roller, yaş kategorileri ve veli izin durumu.</p>
        </div>
        <div className="flex gap-2">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="ogrenci@eposta.com"
            className="w-56 rounded-md border-[1.5px] border-ink/20 bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-deep" />
          <button onClick={invite} className="plate-hover rounded-md bg-ink px-4 py-2.5 font-display text-[12.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">+ DAVET ET</button>
        </div>
      </div>
      {msg && <p className="mt-4 rounded-lg border-2 border-cyan-deep bg-cyan-deep/10 px-4 py-2.5 text-[13px] font-semibold text-cyan-deep">{msg}</p>}
      {!members && <p className="mt-8 font-display text-[14px] font-semibold text-ink/40">Yükleniyor…</p>}

      {members && (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border-2 border-ink bg-white">
            <table className="w-full min-w-[620px] text-left text-[13.5px]">
              <thead className="bg-ink font-display text-[11.5px] tracking-[1px] text-white">
                <tr>{["ÜYE", "ROL", "KATEGORİ", "VELİ İZNİ", "DURUM"].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {active.map(m => (
                  <tr key={m.id} className="hover:bg-paper">
                    <td className="px-4 py-3.5 font-semibold text-ink">{m.name}</td>
                    <td className="px-4 py-3.5"><span className={`rounded-md px-2 py-0.5 font-display text-[10.5px] font-bold ${m.role === "MENTOR" ? "bg-amber-400 text-ink" : "bg-cyan-brand/20 text-cyan-deep"}`}>{m.role}</span></td>
                    <td className="px-4 py-3.5 text-ink/60">{m.cat}</td>
                    <td className={`px-4 py-3.5 font-semibold ${m.consent.includes("✓") ? "text-emerald-700" : m.consent.includes("⚠") ? "text-amber-600" : "text-ink/40"}`}>{m.consent}</td>
                    <td className="px-4 py-3.5"><span className="rounded-md border border-emerald-600 bg-emerald-100 px-2 py-0.5 font-display text-[10.5px] font-bold text-emerald-800">AKTİF</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pending.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-[14px] font-bold tracking-[1px] text-ink/60">BEKLEYEN DAVETLER ({pending.length})</h2>
              <div className="mt-2.5 space-y-2">
                {pending.map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border-[1.5px] border-dashed border-ink/25 bg-white px-4 py-3">
                    <span className="text-[13.5px] font-semibold text-ink/70">✉️ {m.name}</span>
                    <span className="rounded-md border border-amber-600 bg-amber-100 px-2 py-0.5 font-display text-[10.5px] font-bold text-amber-800">{m.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-5 rounded-lg bg-white px-4 py-3 text-[12.5px] text-ink/55">ℹ️ 18 yaş altı üyeler için veli izni etkinlik check-in'inde zorunludur. Eksik izinler Belgeler sayfasından yüklenebilir.</p>
        </>
      )}
    </div>
  );
}
