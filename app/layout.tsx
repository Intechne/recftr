import type {Metadata, Viewport} from "next";
import "./globals.css";
import {getCachedPublicSettings} from "@/lib/public-cache";

export const revalidate=300;

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
    title:{default:`${site} — Maç Günü. Her Gün.`,template:`%s | ${site}`},
    description:"Türkiye'nin resmi RECF robotik ve drone programları. Engage, Achieve, Inspire, Aerial Drone Competition ve ADC Pro. Takım numaranı al, dünya şampiyonasına giden yolculuğa başla.",
    icons:{icon:s.favicon_url||undefined,apple:s.apple_touch_icon_url||s.favicon_url||undefined},
    openGraph:{title:site,description:"RECF Türkiye robotik ve drone programları, etkinlikleri ve takım süreçleri.",images:s.og_image?[{url:s.og_image}]:undefined,type:"website"},
  };
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/></head><body>{children}</body></html>}
