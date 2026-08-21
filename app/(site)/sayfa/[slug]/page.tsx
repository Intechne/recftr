import { getPage } from "@/lib/db";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export default async function CmsPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p:any=await getPage(slug);if(!p)notFound();return <article className="mx-auto max-w-3xl px-5 py-14"><p className="font-display text-[12px] font-semibold tracking-[2px] text-cyan-deep">⬡ RECF TÜRKİYE</p><h1 className="mt-3 font-display text-4xl font-bold text-ink">{p.title}</h1><div className="mt-8 space-y-5">{String(p.body||"").split(/\n\n+/).filter(Boolean).map((par:string,i:number)=><p key={i} className="whitespace-pre-line text-[16px] leading-[1.8] text-ink/70">{par}</p>)}</div></article>}
