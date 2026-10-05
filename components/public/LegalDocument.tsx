import Link from "next/link";
import { LEGAL_DOCUMENTS, legalDocument } from "@/lib/legal-documents";

const headings = new Set(["Veri Sorumlusu", "İşlenen Kişisel Veriler", "Kişisel Verilerin İşlenme Amaçları", "Hukuki Sebepler", "Aktarım", "Toplama Yöntemi", "İlgili Kişi Hakları", "Başvuru Usulü", "Organizatör", "Katılımcı", "Etkinliğin Niteliği ve Risklerin Bilindiği", "Bulaşıcı Hastalıklar ve Sağlık Durumuna İlişkin Kabul", "Kural ve Talimatlara Uyma Yükümlülüğü", "Davranış ve Etik Kurallar", "Kaza, Yaralanma ve Sorumluluk Sınırı", "Robot, Ekipman ve Kişisel Eşyalar", "Acil Durum ve İlk Müdahale", "Beyan"]);

export default function LegalDocument({slug}:{slug:string}) {
  const document = legalDocument(slug)!;
  return <div className="safe-x mx-auto max-w-4xl py-10 sm:py-14 lg:px-10">
    <Link href="/hukuki-belgeler" className="text-xs font-bold tracking-wider text-cyan-deep">HUKUKİ BELGELER →</Link>
    <h1 className="mt-3 font-display text-[clamp(1.75rem,6vw,2.5rem)] font-bold leading-tight text-ink">{document.title}</h1>
    <p className="mt-4 text-sm leading-relaxed text-ink/60">{document.description}</p>
    <div className="mt-6 flex flex-wrap gap-3"><a href={document.pdf} download className="inline-flex min-h-12 items-center rounded-md bg-ink px-5 py-3 text-sm font-bold text-white">ORİJİNAL PDF’İ İNDİR ↓</a><a href={document.pdf} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-md border-2 border-ink px-5 py-3 text-sm font-bold text-ink">PDF’İ AÇ ↗</a></div>
    <p className="mt-5 rounded-lg border border-ink/15 bg-white p-4 text-sm leading-relaxed text-ink/65">Aşağıdaki metin PDF’deki içeriğin web görünümüdür. Tercih, tarih ve imza alanları orijinal belgede yer alır. Bu sayfayı görüntülemek veya takım ön başvurusu yapmak, bu alanların doldurulması ve imzalanması yerine geçmez.</p>
    <article aria-label={document.title} className="mt-8 rounded-xl border border-ink/15 bg-white p-5 sm:p-8">
      {document.pages.map((page,index)=><section key={index} aria-label={`Belge sayfası ${index+1}`} className={index?"mt-8 border-t border-ink/10 pt-8":""}>
        {page.split(/\n\s*\n/).filter(Boolean).map((block,i)=>{
          const [first,...rest]=block.trim().split("\n");
          if(headings.has(first))return <div key={i}><h2 className="mt-6 font-display text-lg font-bold text-ink">{first}</h2>{rest.length>0&&<p className="mt-3 whitespace-pre-line break-words text-[15px] leading-[1.85] text-ink/75">{rest.join("\n")}</p>}</div>;
          if(slug==="acik-riza"&&block.includes("☐"))return <div key={i} className="mt-4 rounded-lg border border-ink/15 p-4"><p className="text-[15px] leading-[1.85] text-ink/75">{block.replace(/☐/g,"").replace(/\s+/g," ").trim()}</p><p className="mt-3 flex flex-wrap gap-5 text-sm font-semibold text-ink/65"><span>Veriyorum ☐</span><span>Vermiyorum ☐</span></p></div>;
          return <p key={i} className="mt-4 whitespace-pre-line break-words text-[15px] leading-[1.85] text-ink/75">{block}</p>;
        })}
      </section>)}
    </article>
    <nav aria-label="Diğer hukuki belgeler" className="mt-8 flex flex-wrap gap-4">{LEGAL_DOCUMENTS.filter(item=>item.slug!==slug).map(item=><Link key={item.slug} href={`/${item.slug}`} className="text-sm font-semibold text-cyan-deep underline">{item.title}</Link>)}</nav>
    <p className="mt-8 text-xs text-ink/50">Web’de yayımlanma: 5 Ekim 2026 · Orijinal belge: {document.pageCount} sayfa</p>
  </div>;
}
