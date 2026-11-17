import { FigmaIcon } from "@/components/FigmaIcon";
import RichText, { SafeLink } from "@/components/public/RichText";
import { parsePageBody, type PageBlock } from "@/lib/site-pages";

type Props = {
  kicker: string;
  title: string;
  body: string;
  /** Hero altında gösterilen birincil eylem (ör. form çapası). */
  action?: { label: string; href: string };
  /** Bölümlerden sonra gelen form / dinamik içerik. */
  children?: React.ReactNode;
  /** Hero sağında gösterilen kısa özet kartı. */
  aside?: React.ReactNode;
};

function Blocks({ blocks, dark = false, lang = "tr" }: { blocks: PageBlock[]; dark?: boolean; lang?: "tr" | "en" }) {
  const out: React.ReactNode[] = [];
  let faqs: Extract<PageBlock, { type: "faq" }>[] = [];
  const flushFaqs = (key: string) => {
    if (!faqs.length) return;
    out.push(<div key={key} className="space-y-3">{faqs.map((faq, i) => <details key={faq.q} open={i === 0} className="group rounded-lg border-[1.5px] border-ink/20 bg-white px-5 py-4 open:border-ink">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-ink"><span>{faq.q}</span><span aria-hidden className="font-display text-xl font-bold leading-none text-cyan-deep group-open:rotate-45 motion-safe:transition-transform">+</span></summary>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/65"><RichText text={faq.a} lang={lang} /></p>
    </details>)}</div>);
    faqs = [];
  };
  blocks.forEach((block, i) => {
    if (block.type === "faq") { faqs.push(block); return; }
    flushFaqs(`faq-${i}`);
    if (block.type === "paragraph") out.push(<p key={i} className={`text-[15px] leading-[1.75] sm:text-[16px] ${dark ? "text-white/70" : "text-ink/65"}`}><RichText text={block.text} lang={lang} /></p>);
    if (block.type === "list") out.push(<ul key={i} className="grid gap-2.5">{block.items.map(item => <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-ink/70"><span aria-hidden className="diamond mt-[7px] h-2.5 w-2.5 shrink-0 rounded-[2px] bg-cyan-brand" /><span><RichText text={item} /></span></li>)}</ul>);
    if (block.type === "note") out.push(<p key={i} className="rounded-lg border-l-4 border-cyan-brand bg-cyan-brand/10 px-4 py-3.5 text-[14.5px] font-semibold leading-relaxed text-ink"><RichText text={block.text} lang={lang} /></p>);
    if (block.type === "button") out.push(<p key={i}><SafeLink href={block.href} className="inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-ink bg-white px-4 py-2.5 font-display text-[12.5px] font-bold text-ink transition-colors hover:bg-ink hover:text-white">{block.label} →</SafeLink></p>);
  });
  flushFaqs("faq-end");
  return <div className="space-y-4">{out}</div>;
}

/** CMS'ten gelen site sayfası: saha dokulu hero + numaralı editoryal bölümler. */
export default function SitePageView({ kicker, title, body, action, children, aside, lang = "tr" }: Props & { lang?: "tr" | "en" }) {
  const page = parsePageBody(body);
  return <div className="pb-20">
    <section className="field-grid relative overflow-hidden border-b-2 border-ink">
      <div aria-hidden className="home-orbit home-orbit-blue absolute -right-16 -top-16 h-32 w-32 rotate-45 bg-alliance-blue/85 sm:-right-20 sm:-top-20 sm:h-44 sm:w-44" />
      <div className={`safe-x relative mx-auto grid max-w-7xl gap-8 py-12 lg:px-10 lg:py-20 ${aside ? "lg:grid-cols-[1.3fr_.7fr] lg:items-end" : ""}`}>
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded bg-ink px-3 py-2 font-display text-xs font-bold tracking-[1.5px] text-cyan-brand sm:text-xs"><FigmaIcon name="robot" className="h-4 w-4" /> {kicker}</p>
          <h1 className="mt-5 max-w-4xl break-words font-display text-[clamp(2.3rem,8vw,4.5rem)] font-bold leading-[.98] text-ink">{title}</h1>
          <div className="mt-5 max-w-2xl space-y-3">{page.intro.length ? <Blocks blocks={page.intro} lang={lang} /> : null}</div>
          {action && <a href={action.href} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-ink bg-ink px-5 py-3 font-display text-sm font-bold text-white shadow-plateSm shadow-cyan-brand transition-transform hover:-translate-y-0.5">{action.label} →</a>}
        </div>
        {aside}
      </div>
    </section>
    <div className="safe-x mx-auto max-w-7xl lg:px-10">
      {page.sections.map((section, index) => <section key={section.heading} className="grid gap-5 border-b border-ink/15 py-10 sm:py-12 lg:grid-cols-[.85fr_1.6fr] lg:gap-10">
        <div><p className="font-display text-sm font-bold text-cyan-deep">{String(index + 1).padStart(2, "0")}</p><h2 className="mt-2 font-display text-[26px] font-bold leading-tight text-ink sm:text-[30px]">{section.heading}</h2></div>
        <div className="min-w-0 cms-content"><Blocks blocks={section.blocks} lang={lang} /></div>
      </section>)}
      {children}
    </div>
  </div>;
}
