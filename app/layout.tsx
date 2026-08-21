import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RECF Türkiye — Maç Günü. Her Gün.",
    template: "%s | RECF Türkiye",
  },
  description:
    "Türkiye'nin resmi RECF robotik ve drone programları. Engage, Achieve, Inspire, Aerial Drone Competition ve ADC Pro. Takım numaranı al, dünya şampiyonasına giden yolculuğa başla.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
