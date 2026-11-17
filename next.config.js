/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

let supabaseHost = "";
try { supabaseHost = new URL(process.env.SUPABASE_URL || "").hostname; } catch {}

const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    // CMS medyası Supabase Storage public bucket'ından gelir.
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: ["postgres"],
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Yayından kaldırılan (taslağa alınan) etkinlik sayfaları: 404 yerine etkinlik takvimine kalıcı yönlendirme.
  async redirects() {
    return ["recf-turkiye-lansmani", "recf-turkiye-kick-off"].map(slug => ({ source: `/etkinlikler/${slug}`, destination: "/etkinlikler", statusCode: 301 }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders },
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/logos/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/(llms.txt|manifest.webmanifest)", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] },
      { source: "/og/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      // Yönetim/giriş ve kişiye özel teşekkür sayfaları arama motorlarına kapalı.
      ...["/cms-giris", "/admin/:path*", "/admin", "/giris", "/portal/:path*", "/kayit/tesekkurler"].map(source => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }))];
  },
};
module.exports = nextConfig;
