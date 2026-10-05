import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/Motion";
import {FigmaIcon,type FigmaIconName} from "@/components/FigmaIcon";

export const metadata: Metadata = { title: "Mentor Nasıl Olunur?" };

const cols:{title:string;icon:FigmaIconName;hex:string;items:string[]}[] = [
  { title: "KİM OLABİLİR?", icon:"mentor", hex: "#29B9E5", items: ["18 yaşını doldurmuş herkes", "Öğretmenler ve okul personeli", "Veliler", "Mühendisler & sektör gönüllüleri", "Üniversite öğrencileri"] },
  { title: "SORUMLULUKLAR", icon:"defter", hex: "#10192F", items: ["Takımın resmi kaydını yönetmek", "Etkinlik günü takımın başında olmak", "Güvenlik ve davranış kurallarını gözetmek", "Öğrenci odaklı çalışmayı korumak (robotu öğrenciler yapar)", "İletişim: veli ↔ RECF Türkiye"] },
  { title: "KAYNAKLAR VE DUYURULAR", icon:"rozet", hex: "#8DC63F", items: ["Resmî oyun kılavuzları ve soru-cevap kaynakları", "Takım ön başvuru rehberi", "Etkinlik takvimi", "Mentor eğitimleri: yeni tarih duyurusu bekleniyor", "Güncel program duyuruları"] },
];
const proc = [
  { t: "Programı seç", d: "Takımına uygun robotik veya drone programını incele." },
  { t: "Takım bilgilerini hazırla", d: "Okul, şehir ve takım bilgilerini belirle." },
  { t: "Ön başvuruyu gönder", d: "Takım kayıt formuna mentor iletişim bilgilerini ekle." },
  { t: "Duyuruları takip et", d: "Eğitim tarihleri ve sonraki kayıt adımları ayrıca duyurulur." },
];

export default function MentorPage() {
  return (
    <div className="pb-20">
      <section className="field-grid-dark relative overflow-hidden bg-ink">
        <div aria-hidden className="absolute -top-20 right-[-5rem] h-44 w-44 rotate-45 bg-adc" />
        <div className="safe-x mx-auto max-w-7xl py-10 sm:py-14 lg:px-10">
          <p className="font-display text-[12px] font-semibold tracking-[2px] text-cyan-brand">KATILIM / MENTORLUK</p>
          <h1 className="mt-3.5 font-display text-[clamp(2rem,8vw,3.125rem)] font-bold leading-tight text-white lg:text-[50px]">MENTOR NASIL OLUNUR?</h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">
            Öğretmen, veli, mühendis veya üniversite öğrencisi — bir takımın arkasındaki
            yetişkin sen olabilirsin. Teknik uzmanlık şart değil; rehberlik yeterli.
          </p>
          <Link href="/kayit" className="plate-hover mt-6 inline-block rounded-md bg-adc px-6 py-3.5 font-display text-[15px] font-bold text-[#0d1f08] shadow-plateSm shadow-white/25">
            TAKIMINLA ÖN BAŞVURU YAP
          </Link>
        </div>
      </section>

      <div className="safe-x mx-auto max-w-7xl pt-10 sm:pt-12 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {cols.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div className="h-full rounded-xl border-2 border-ink bg-white p-6 shadow-plateSm" style={{ ["--tw-shadow-color" as string]: c.hex }}>
                <h2 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><FigmaIcon name={c.icon} className="h-5 w-5"/>{c.title}</h2>
                <ul className="mt-3.5 space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink/60">
                      <span className="mt-1 text-[9px]" style={{ color: c.hex }} aria-hidden>◆</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink/60">Takım formu ön başvuru içindir. Mentor eğitimi, resmî takım kaydı veya sertifika kaydı yerine geçmez. <Link href="/rehber/takim-kaydi" className="font-semibold text-cyan-deep underline">Kayıt adımlarını incele</Link>.</p>
        <h2 className="mt-14 font-display text-[26px] font-bold text-ink">BAŞVURU SÜRECİ</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proc.map((s, i) => (
            <div key={s.t} className="relative rounded-xl border-[1.5px] border-ink/20 bg-white p-6 text-center">
              <span className="diamond mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-adc font-display text-[16px] font-bold text-[#0d1f08]"><span>{i + 1}</span></span>
              <h3 className="mt-4 font-display text-[16px] font-bold text-ink">{s.t}</h3>
              <p className="mt-1.5 text-[12.5px] text-ink/55">{s.d}</p>
              {i < proc.length - 1 && <span aria-hidden className="absolute -right-4 top-1/2 hidden -translate-y-1/2 font-display text-[22px] font-bold text-ink/30 lg:block">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-6 text-[14px] text-ink/55">
          Sorular için: <a href="mailto:destek@recfturkiye.com" className="font-semibold text-cyan-deep underline">destek@recfturkiye.com</a> · Yeni eğitim tarihi henüz duyurulmadı. <Link href="/duyurular" className="font-semibold text-cyan-deep underline">Duyuruları takip et</Link>.
        </p>
      </div>
    </div>
  );
}
