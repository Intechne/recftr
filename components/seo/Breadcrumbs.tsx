import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";
export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Ana Sayfa", path: "/" }, ...items];
  return (
    <nav aria-label="Sayfa yolu" className="safe-x mx-auto max-w-7xl pt-5 text-[12px] text-ink/50 lg:px-10">
      <JsonLd data={breadcrumbLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {i === all.length - 1 ? <span className="font-semibold text-ink/70" aria-current="page">{it.name}</span> : <Link href={it.path} className="hover:text-cyan-deep">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
