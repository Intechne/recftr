"use client";
import { useEffect, useState } from "react";

type Doc = { id: number; name: string; descr: string; required: number | boolean; status: string; date_label: string };
const badge: Record<string, string> = {
  "ONAYLI": "bg-emerald-100 text-emerald-800 border-emerald-600",
  "İNCELEMEDE": "bg-amber-100 text-amber-800 border-amber-600",
  "EKSİK": "bg-red-100 text-red-700 border-red-600",
};

export default function BelgelerPage() {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [note, setNote] = useState("");
  const load = () => fetch("/api/team").then(r => r.ok ? r.json() : null).then(d => d && setDocs(d.docs));
  useEffect(() => { load(); }, []);

  const upload = async (d: Doc) => {
    await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id }) });
    setNote(`"${d.name}" yüklendi — RECF ekibi incelemesine alındı.`);
    load();
  };
  const done = docs?.filter(d => d.status === "ONAYLI").length ?? 0;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[26px] font-bold text-ink">BELGELER</h1>
      <p className="mt-1 text-[14.5px] text-ink/60">Sezon ve etkinlik katılımı için gereken evrak durumu — canlı kayıt.</p>
      {docs && (
        <div className="mt-6 rounded-xl border-2 border-ink bg-white p-5 shadow-plateSm shadow-cyan-brand">
          <div className="flex items-center justify-between">
            <p className="font-display text-[14px] font-bold text-ink">TAMAMLANMA</p>
            <p className="font-display text-[14px] font-bold text-cyan-deep">{done}/{docs.length} belge onaylı</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-cyan-brand transition-all" style={{ width: `${docs.length ? (done / docs.length) * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-[12.5px] text-ink/50">Zorunlu belgeler tamamlanmadan etkinlik check-in QR kodu üretilmez.</p>
        </div>
      )}
      {note && <p className="mt-4 rounded-lg border-2 border-cyan-deep bg-cyan-deep/10 px-4 py-3 text-[13.5px] font-semibold text-cyan-deep">{note}</p>}
      {!docs && <p className="mt-8 font-display text-[14px] font-semibold text-ink/40">Yükleniyor…</p>}
      <div className="mt-5 space-y-3">
        {docs?.map(d => (
          <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] border-ink/15 bg-white p-4">
            <span className="font-display text-[20px]">📄</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-bold text-ink">
                {d.name} {!!d.required && <span className="ml-1 rounded bg-ink px-1.5 py-0.5 align-middle font-display text-[9.5px] font-bold tracking-[1px] text-cyan-brand">ZORUNLU</span>}
              </p>
              <p className="text-[13px] text-ink/55">{d.descr}{d.date_label ? ` · Son işlem: ${d.date_label}` : ""}</p>
            </div>
            <span className={`rounded-md border px-2.5 py-1 font-display text-[11px] font-bold ${badge[d.status] ?? badge["EKSİK"]}`}>{d.status}</span>
            {d.status !== "ONAYLI" && (
              <button onClick={() => upload(d)} className="plate-hover rounded-md bg-ink px-3.5 py-2 font-display text-[12px] font-bold text-white shadow-plateSm shadow-cyan-brand">
                {d.status === "EKSİK" ? "YÜKLE ↑" : "YENİDEN YÜKLE"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
