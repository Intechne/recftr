# RECF Türkiye — ilk teknik düzeltme

4 Ekim 2026. Yerel dal: `fix/security-baseline`. Başlangıç commit'i: `f4d6c4eb524093b2572af33a6d29ad2a93055576`.

**Durum:** Güncelleme ayrı çalışma dalında hazır ve yerelde test edildi. Bu dal ana dala alınmadan ve yayınlanmadan canlı sitede uygulanmış sayılmaz. Üretim yapılandırması ve oturumlu iş akışları henüz doğrulanmadı; veritabanı değiştirilmedi.

## Hazırlanan değişiklikler

- Next.js `15.5.21` → `15.5.27`: mevcut ana sürüm korunarak resmî güvenlik yaması.
- PostCSS `8.4.38` → `8.5.28`: doğrudan ve Next.js içindeki PostCSS aynı yamalı sürüme sabitlendi.
- Sharp `0.34.5` → `0.35.5`: Next.js'in görüntü işleme bağımlılığı override ile güncellendi. Kullanılan ön derlenmiş libheif `1.23.5`.
- Supabase JS `2.112.4` sürümüne sabitlendi; mevcut kilit dosyası bu sürümü kullanıyordu, bu değişiklik bir Supabase sürüm yükseltmesi değil.
- Mevcut `package-lock.json` yeni bağımlılık ağacıyla güncellendi.
- `outputFileTracingRoot` proje klasörüne sabitlendi. Üst klasördeki başka bir kilit dosyasının yanlış çalışma kökü seçilmesine neden olan derleme uyarısı giderildi.
- Kullanım Koşulları ve Çerez Politikası, diğer kamu sayfalarıyla aynı önbellek/yenileme katmanına geçirildi. Metinler değişmedi; mevcut içerik kontrolündeki hata giderildi.
- `npm run security:images`: Next.js'in gerçek görüntü işleme işlevi üzerinden oluşturulan bir test görselini WebP, AVIF ve JPEG'e çevirme, yeniden boyutlandırma ve tekrar okuma kontrolü eklendi.

## Doğrulama

Node `24.19.0`, yerel macOS ortamı:

| Kontrol | Sonuç |
|---|---|
| Temiz kilit dosyası kurulumu: `npm ci --ignore-scripts --no-audit --no-fund` | Başarılı |
| `npm run typecheck` | Başarılı |
| `npm run security:static` | 27/27 |
| `npm run content:check` | 23/23 |
| `npm run security:images` | WebP, AVIF, JPEG başarılı |
| `npm run build` | Başarılı; çalışma kökü uyarısı giderildi |
| `npm audit --omit=dev` | 0 bilinen güvenlik uyarısı |
| Yerel HTTP kontrolü | 6 kamu sayfası 200, admin/portal 307, 3 özel API 401/403; güvenlik başlıkları mevcut |
| Görsel inceleme | Kullanım Koşulları masaüstü, Çerez Politikası 390 px mobil; mobil yatay taşma yok |

Bu sonuçlar tam penetrasyon testi veya güvenlik garantisi değildir. Canlı veritabanı bağlantısı kullanılmadı; yerel sayfalar yedek içerikle çalıştı. Gerçek kayıt, yönetici girişi, dosya erişimi ve CMS yayınından sonra önbellek yenileme davranışı staging ortamında ayrıca denenmeli. Vercel Linux görüntü işleme kontrolü de preview yayında tekrarlanmalı.

## Kalan paket uyarısı

Tam `npm audit`, geliştirme bağımlılıklarında 5 yüksek seviye paket uyarısı gösteriyor: `braces`, `chokidar`, `fast-glob`, `micromatch`, `tailwindcss`. Bunlar aynı `braces` sorununun bağımlılık ağacına yansıması; beş ayrı canlı istismar kanıtı değildir.

`braces <=3.0.3` için incelenen resmî kayıtta henüz yamalı sürüm yok. npm'in önerdiği Tailwind 4 geçişi ayrı bir CSS uyumluluk ve görsel karşılaştırma işi olarak ele alınmalı. Bu dalda zorla ana sürüm yükseltmesi veya güvenlik uyarısını gizleyen bir işlem yapılmadı. Build araçları güvenilir kaynaklarla çalışmalı; kullanıcı girdisi glob/build deseni olarak işlenmemeli.

## Kod üzerinden kapatılan şüphe

`app/api/applications/route.ts`, ücreti ayarlardan sunucuda hesaplayıp veritabanına bu toplamı yazıyor. İstemciden gelen `total` değerine güvenildiği doğrulanmadı. Canlı deployment'ın bu kaynak commit'i kullandığı ayrıca kontrol edilmeli.

## Canlı erişim için gerekenler

- Vercel: `intechne-teknoloji-s-projects` ekibindeki `recftr`. Bağlı Codex hesabı bu kapsam için 403 yetki hatası aldı.
- Supabase: `ljavfjrwvhdxutbszrwj`. Bağlı Codex hesabının bu projeye erişimi reddedildi.
- İlgili hesaplarla bağlantı yenilendiğinde repo/production branch, Node 24, preview/production ortam ayrımı, rollback ve gerçek veritabanı rolü doğrulanmalı.
- Supabase'de tablo/grant/RLS, özel Storage, güvenlik danışmanı sonuçları ve mevcut CMS MFA durumu incelenmeli. Parola veya MFA anahtarı bu rapora yazılmamalı.
- Preview testleri ve veri erişim kontrolü tamamlanınca canlı yayına aktarılıp aynı kontroller tekrarlanmalı.

## Kaynaklar

- [Next.js 30 Eylül güvenlik yayını](https://nextjs.org/blog/september-2026-security-release)
- [Sharp/libheif güvenlik kaydı](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)
- [PostCSS kaynak haritası güvenlik kaydı](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)
- [Braces güvenlik kaydı ve yama durumu](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [Next.js çıktı dosyası izleme ayarı](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

Yerel test kanıtları üst çalışma klasöründeki `build-final.log`, `dependency-audit-final.json`, `dependency-audit-production.json`, `local-smoke.json`, `local-legal-desktop.jpg` ve `local-cookie-mobile.jpg` dosyalarında saklandı.
