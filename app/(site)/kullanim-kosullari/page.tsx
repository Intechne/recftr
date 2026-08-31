import type { Metadata } from "next";
import { getPage } from "@/lib/db";
import { LEGAL_FALLBACK } from "@/lib/legal-fallback";
import { pageMeta } from "@/lib/seo";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
export const dynamic = "force-dynamic";
const SLUG = "kullanim-kosullari";
export const metadata: Metadata = pageMeta({ title: LEGAL_FALLBACK[SLUG].title, description: LEGAL_FALLBACK[SLUG].body.slice(0, 155).replace(/\n/g, " "), path: "/" + SLUG });
export default async function KullanimKosullari() {
  let p: any = null; try { p = await getPage(SLUG); } catch {}
  const title = p?.title ?? LEGAL_FALLBACK[SLUG].title, body = p?.body ?? LEGAL_FALLBACK[SLUG].body;
  return (<><Breadcrumbs items={[{ name: title, path: "/" + SLUG }]} /><article className="mx-auto max-w-3xl px-5 py-12">
    <p className="font-display text-[13px] font-semibold tracking-[2px] text-cyan-deep">⬡ YASAL</p>
    <h1 className="mt-2 font-display text-[34px] font-bold text-ink">{String(title).toUpperCase()}</h1>
    <div className="mt-8 space-y-5">{String(body).split("\n\n").map((par: string, i: number) => <p key={i} className="text-[15.5px] leading-[1.75] text-ink/75">{par}</p>)}</div>
    <p className="mt-10 text-[12.5px] text-ink/45">Son güncelleme: {p?.updated ? new Date(p.updated).toLocaleDateString("tr-TR") : "31 Ağustos 2026"}</p>
  </article></>);
}
