import Link from "next/link";
export const metadata = { title: "Takım Portalı — Yakında | RECF Türkiye" };

export default function GirisPage() {
  return (
    <div className="field-grid-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-12">
      <div aria-hidden className="absolute -left-24 -top-24 h-56 w-56 rotate-45 bg-alliance-red/70" />
      <div aria-hidden className="absolute -bottom-24 -right-24 h-56 w-56 rotate-45 bg-alliance-blue/70" />
      <div className="w-full max-w-xl text-center">
        <Link href="/" className="font-display text-[22px] font-bold text-cyan-brand">⬡ RECF TÜRKİYE</Link>
        <p className="mx-auto mt-8 inline-block rounded-md border border-cyan-brand/50 bg-cyan-brand/10 px-3.5 py-1.5 font-display text-[12px] font-bold tracking-[2px] text-cyan-brand">GELİŞTİRME AŞAMASINDA</p>
        <h1 className="mt-5 font-display text-[34px] font-bold leading-tight text-white sm:text-[42px]">TAKIM PORTALI YAKINDA</h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/65">
          Mentor girişi, üye yönetimi, belge yükleme ve etkinlik kayıtları için Takım Yönetim Platformu son hazırlık aşamasında.
          Sezon başvuruları şimdiden açık: mentor ve takım kaydını bugün tamamla, portal yayına alındığında giriş bilgilerin kayıtlı e-postana gelsin.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/kayit" className="plate-hover rounded-md bg-cyan-brand px-6 py-3.5 font-display text-[14px] font-bold text-ink shadow-plateSm shadow-white/25">MENTOR & TAKIM KAYDI →</Link>
          <Link href="/etkinlikler" className="rounded-md border-2 border-white/35 px-6 py-3.5 font-display text-[14px] font-bold text-white hover:border-cyan-brand">ETKİNLİK TAKVİMİ</Link>
        </div>
        <p className="mt-8 text-[12.5px] text-white/40">Sorular için: etkinlik@recfturkiye.com</p>
      </div>
    </div>
  );
}
