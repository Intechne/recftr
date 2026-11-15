import type {Metadata, Viewport} from "next";
import "./globals.css";
import {getCachedPublicSettings} from "@/lib/public-cache";
import {SITE_URL, organizationLd, websiteLd} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {Analytics} from "@vercel/analytics/next";
import {headers} from "next/headers";
import {isEnglishPath} from "@/lib/i18n";
import {Chakra_Petch,Inter} from "next/font/google";

// Self-host: harici font CSS'i render'ı bloklamaz, CSP font-src 'self' ile uyumlu.
const display=Chakra_Petch({subsets:["latin","latin-ext"],weight:["400","500","600","700"],display:"swap",variable:"--font-display"});
const sans=Inter({subsets:["latin","latin-ext"],display:"swap",variable:"--font-sans"});

export const dynamic="force-dynamic";

export const viewport:Viewport={
  width:"device-width",
  initialScale:1,
  viewportFit:"cover",
  themeColor:"#10192F",
};

export async function generateMetadata():Promise<Metadata>{
  let s:Record<string,string>={};
  try{s=(await getCachedPublicSettings()) as Record<string,string>}catch{}
  const site=s.site_name||"RECF Türkiye";
  return {
    metadataBase:new URL(SITE_URL),
    alternates:{canonical:"/"},
    manifest:"/manifest.webmanifest",
    robots:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1},
    keywords:["RECF Türkiye","robotik yarışması","drone yarışması","Aerial Drone Competition","RECF Engage","RECF Achieve","RECF Inspire","robotik eğitimi","STEM Türkiye","Intechne"],
    title:{default:`${site} — Maç Günü. Her Gün.`,template:`%s | ${site}`},
    description:"Türkiye'nin resmi RECF robotik ve drone programları. Engage, Achieve, Inspire, Aerial Drone Competition ve ADC Pro. Programları keşfet, takım ön başvurusu ve etkinlik bilgilerine ulaş.",
    icons:{icon:s.favicon_url||"/logos/icon-512.png",apple:s.apple_touch_icon_url||"/logos/apple-touch-icon.png"},
    openGraph:{title:site,description:"RECF Türkiye robotik ve drone programları, etkinlikleri ve takım süreçleri.",images:s.og_image?[{url:s.og_image}]:undefined,type:"website",siteName:site,locale:"tr_TR",url:SITE_URL},
    twitter:{card:"summary_large_image",title:site,description:"RECF Türkiye robotik ve drone programları, etkinlikleri ve takım süreçleri.",images:s.og_image?[s.og_image]:undefined},
  };
}
export default async function RootLayout({children}:{children:React.ReactNode}){
  const path=(await headers()).get("x-pathname")||"/";
  let s:Record<string,string>={};
  try{s=(await getCachedPublicSettings()) as Record<string,string>}catch{}
  const sameAs=[s.instagram,s.youtube,s.linkedin].filter((url):url is string=>!!url&&/^https:\/\//.test(url));
  return <html lang={isEnglishPath(path)?"en":"tr"} className={`${display.variable} ${sans.variable}`}><body><a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-3 focus:font-display focus:text-sm focus:font-bold focus:text-white">{isEnglishPath(path)?"Skip to content":"İçeriğe geç"}</a><JsonLd data={[organizationLd(sameAs),websiteLd()]}/>{children}<Analytics/></body></html>}
