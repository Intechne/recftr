import Image from "next/image";

/** Supabase Storage public URL'leri next/image ile optimize edilir; diğer adresler düz <img> kalır. */
export function optimizable(src: string) {
  try { const url = new URL(src); return url.protocol === "https:" && url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/object/public/"); } catch { return false; }
}

type Props = { src: string; alt: string; sizes: string; className?: string; priority?: boolean };

/** Ebeveyni `relative` (ve boyutlu) olan kutuyu dolduran CMS görseli. */
export default function CmsImage({ src, alt, sizes, className = "", priority = false }: Props) {
  if (optimizable(src)) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className={`absolute inset-0 h-full w-full ${className}`} />;
}
