# V3.1.4 — Serverless Stability Hotfix

## Kök neden
V3.1.3 public sayfaları server-side'a taşıdı ancak public root request üzerinde sorgu fan-out'u oluştu:

- root metadata: settings DB sorgusu
- public site layout: settings + content revision
- homepage: programs + events + news + media + settings + stats
- stats: kendi içinde 5 ek paralel sorgu

Postgres.js pool `max:3` olduğundan cold start / Supabase gecikmesinde sorgular kuyruklandı ve Vercel `FUNCTION_INVOCATION_TIMEOUT` / HTTP 504 üretmeye başladı.

## V3.1.4 çözümü
- Homepage public data tek `getPublicHomeSnapshot()` SQL statement'ına indirildi.
- Public reads `unstable_cache` + `public-content` tag ile cache'leniyor.
- CMS mutations `revalidateTag('public-content')` ile cache'i invalidate ediyor.
- Public sayfalarda `@/lib/db` doğrudan import kaldırıldı.
- Site shell ve root metadata aynı cache'li public settings kaynağını kullanıyor.
- ContentRefreshBridge DB polling yapmıyor; sadece aynı browser'daki CMS değişikliğini `localStorage` ile algılıyor.
- Admin ve Portal başarılı API mutation'larını otomatik duyurmak için `ContentMutationBridge` kullanıyor.
- Postgres connection `connect_timeout: 5` ile fail-fast.
- Public cached readers DB/cache hatasında fallback döndürerek ziyaretçi sayfasını 504 yerine render etmeye çalışıyor.
- V3.1.3 program logo white-plate/object-contain ve responsive media guardrail'leri korunuyor.

## Migration
Yok.
