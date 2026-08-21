import { getPage } from "@/lib/db";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function GizlilikPage() {
  const p = await getPage("gizlilik");
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-display text-[13px] font-semibold tracking-[2px] text-cyan-deep">⬡ YASAL</p>
      <h1 className="mt-2 font-display text-[34px] font-bold text-ink">{p.title.toUpperCase()}</h1>
      <div className="mt-8 space-y-5">
        {String(p.body).split("\n\n").map((par: string, i: number) => (
          <p key={i} className="text-[15.5px] leading-[1.75] text-ink/75">{par}</p>
        ))}
      </div>
      <p className="mt-10 text-[12.5px] text-ink/45">Son güncelleme: {new Date(p.updated).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
  );
}
