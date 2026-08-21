import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { news, newsBySlug } from "@/lib/data";
import { getNews } from "@/lib/db";
import { Photo } from "@/components/Ui";

export const dynamicParams = true;
export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = newsBySlug(slug);
  return { title: n?.title ?? "Haber" };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let n = newsBySlug(slug);
  if (!n) {
    const db = await getNews(slug);
    if (!db) notFound();
    n = { slug: db.slug, tag: db.tag, title: db.title, excerpt: db.excerpt, date: new Date(db.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }), featured: false,
      body: [{ type: "lead" as const, text: db.excerpt }, ...String(db.body || "").split("\n\n").filter(Boolean).map((t: string) => ({ type: "p" as const, text: t }))] };
  }
  const body = n.body ?? [
    { type: "lead" as const, text: n.excerpt },
    { type: "p" as const, text: "Bu haberin tam metni yakında yayınlanacak. Gelişmeler için duyurular sayfasını takip edin veya bültenimize katılın." },
  ];
  const related = news.filter((x) => x.slug !== n.slug).slice(0, 3);

  return (
    <article className="pb-20">
      <div className="mx-auto max-w-3xl px-5 pt-12">
        <p className="font-display text-[12px] font-semibold tracking-[2px] text-cyan-deep">
          <Link href="/duyurular" className="hover:underline">DUYURULAR</Link> / {n.tag}
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink lg:text-[40px]">{n.title}</h1>
        <div className="mt-4 flex items-center gap-4">
          <span className="rounded bg-cyan-brand px-2.5 py-1 font-display text-[11px] font-bold text-ink">{n.tag}</span>
          <span className="text-[14px] text-ink/50">{n.date} · RECF Türkiye İletişim Ekibi · 4 dk okuma</span>
        </div>
      </div>
      <Photo label={`Kapak fotoğrafı — ${n.title.slice(0, 40)}…`} tone="from-[#2e4780] to-ink" className="mx-auto mt-8 h-64 max-w-5xl rounded-xl lg:h-80" />
      <div className="mx-auto mt-10 max-w-3xl space-y-6 px-5">
        {body.map((b, i) => {
          if (b.type === "h") return <h2 key={i} className="pt-2 font-display text-[24px] font-bold text-ink">{b.text}</h2>;
          if (b.type === "lead") return <p key={i} className="text-[18px] font-semibold leading-relaxed text-ink">{b.text}</p>;
          if (b.type === "quote") return <blockquote key={i} className="border-l-4 border-cyan-brand pl-5 text-[17px] font-semibold leading-relaxed text-cyan-deep">{b.text}</blockquote>;
          return <p key={i} className="text-[16px] leading-[1.7] text-ink/70">{b.text}</p>;
        })}
        <div className="flex flex-wrap items-center gap-2.5 pt-4">
          <span className="font-display text-[12px] font-semibold tracking-[1px] text-ink/45">PAYLAŞ:</span>
          {["X", "LINKEDIN", "WHATSAPP", "LİNKİ KOPYALA"].map((s) => (
            <button key={s} className="rounded-md border-[1.5px] border-ink/25 bg-white px-3 py-1.5 font-display text-[11px] font-semibold text-ink transition-colors hover:border-ink">{s}</button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-5xl px-5">
        <h2 className="font-display text-[20px] font-bold text-ink">İLGİLİ HABERLER</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {related.map((r) => (
            <Link key={r.slug} href={`/duyurular/${r.slug}`} className="rounded-xl border-[1.5px] border-ink/20 bg-white p-5 transition-shadow hover:shadow-md">
              <span className="font-display text-[10px] font-bold tracking-wider text-cyan-deep">{r.tag}</span>
              <p className="mt-2 font-semibold leading-snug text-ink">{r.title}</p>
              <p className="mt-2.5 text-[12px] text-ink/45">{r.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
