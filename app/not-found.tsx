import Link from "next/link";

export default function NotFound() {
  return (
    <div className="field-grid-dark flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center">
      <div className="-rotate-3 overflow-hidden rounded-2xl border-4 border-cyan-brand bg-white shadow-plateLg shadow-cyan-brand/50">
        <div className="flex items-center justify-between gap-10 bg-ink px-5 py-2.5">
          <span className="font-display text-[13px] font-bold text-cyan-brand">TR · RECF</span>
          <span className="font-display text-[11px] text-white/50">SAHA DIŞI</span>
        </div>
        <p className="px-6 py-4 font-display text-[clamp(4rem,25vw,6rem)] font-bold tracking-[clamp(2px,1.5vw,6px)] text-ink sm:px-10">404</p>
      </div>
      <h1 className="mt-8 text-center font-display text-[24px] font-bold text-white sm:text-[28px]">BU PLAKA KAYITLI DEĞİL.</h1>
      <p className="mt-2 max-w-md text-center text-[15px] text-white/60">Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Seni sahaya geri götürelim.</p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className="rounded-md bg-cyan-brand px-5 py-3 font-display text-[14px] font-bold text-ink">ANA SAYFA</Link>
        <Link href="/etkinlikler" className="rounded-md border-2 border-white/40 px-5 py-3 font-display text-[14px] font-bold text-white">ETKİNLİKLER</Link>
      </div>
    </div>
  );
}
