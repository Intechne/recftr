"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
const KEY = "recf_cookie_consent_v1";
export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem(KEY)) setShow(true); } catch { setShow(true); } }, []);
  if (!show) return null;
  const accept = () => { try { localStorage.setItem(KEY, JSON.stringify({ essential: true, at: Date.now() })); } catch {} setShow(false); };
  return (
    <div role="dialog" aria-live="polite" aria-label="Çerez bildirimi" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-xl border-2 border-ink bg-white p-4 shadow-plateSm shadow-cyan-brand sm:inset-x-6 sm:p-5">
      <p className="text-[13px] leading-relaxed text-ink/75">
        Bu site yalnızca <strong>zorunlu çerezler</strong> kullanır (oturum ve güvenlik). Reklam veya izleme çerezi yoktur; tercihiniz cihazınızda saklanır.
        Ayrıntılar: <Link href="/cerez-politikasi" className="font-semibold text-cyan-deep underline">Çerez Politikası</Link> · <Link href="/gizlilik" className="font-semibold text-cyan-deep underline">Gizlilik</Link>
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={accept} className="rounded-md bg-ink px-4 py-2 font-display text-[12.5px] font-bold text-white">ANLADIM</button>
      </div>
    </div>
  );
}
