# V3.1.3 — Content Consistency & Responsive Media

Bu sürüm V3.1.2 güvenlik hardening tabanını korur ve CMS → public site veri akışını kalıcı olarak yeniden düzenler.

## 1. CMS değişikliklerinin geri dönmesi / gecikmesi

- Public shell (`Ticker`, `Nav`, `Footer`) artık `/api/settings` üzerinden client-side fallback fetch yapmıyor.
- Site shell ayarları doğrudan PostgreSQL'den server-side okunuyor.
- Ana sayfa ve program listesi doğrudan server-side CMS verisiyle render ediliyor.
- Haberler, etkinlikler, dokümanlar, takımlar, galeri, hakkımızda ve takım kayıt başlangıç verileri server-side okunup interaktif client bileşenlerine prop olarak aktarılıyor.
- Böylece CMS verisi SEO HTML'inde de bulunuyor; yükleme anında eski hard-coded/fallback içerik gösterilmiyor.
- Public CMS data GET'lerinde client fetch tabakası kaldırıldı.

## 2. Content revision / canlı sekme senkronizasyonu

- `settings.content_revision` anahtarı otomatik oluşturulur/güncellenir; migration gerektirmez.
- CMS'de public içerik değiştiğinde revision güncellenir ve ilgili Next.js path'leri revalidate edilir.
- `/api/content-revision` no-store endpoint'i eklendi.
- Açık public sekmeler focus/visibility değişiminde revision kontrol eder; içerik değişmişse tam reload ile bütün legacy/client state de tazelenir.
- Görünür sekmeler 60 saniyede bir hafif revision kontrolü yapar.

## 3. Atomic settings + stale-tab overwrite koruması

- Site Ayarları artık tek transaction içinde kaydedilir (`setSettingsAtomic`).
- Yarım ayar setinin public siteye görünmesi engellenir.
- `X-Content-Revision` ve `If-Match` tabanlı optimistic concurrency eklendi.
- Eski bir CMS sekmesi daha yeni ayarları sessizce overwrite etmeye çalışırsa `409 CONTENT_REVISION_CONFLICT` döner.
- Başarılı kayıttan sonra CMS formu DB'den gerçekten persist edilen değerlerle yeniden senkronize edilir.

## 4. Program logoları / program görselleri

- Program listesinde program görseli beyaz plate üzerinde `object-contain` ile gösterilir.
- Program detay hero görseli beyaz, çerçeveli plate içinde `object-contain` kullanır.
- Transparan/dark logo görselleri lacivert arka planda kaybolmaz.
- CMS program görseli önizlemesi de aynı contain mantığına geçirildi.

## 5. Mobil medya taşması

- Global `img/video/canvas/svg max-inline-size:100%` guard eklendi.
- `cms-media-frame`, `cms-media-cover`, `cms-media-contain` yardımcı sınıfları eklendi.
- `html/body` yatay overflow `clip`; `main` min-width/max-width guard eklendi.
- Flex/grid CMS kartlarına kritik `min-w-0`, `break-words`, `overflow-hidden` korumaları eklendi.
- Haber, etkinlik, takım ve galeri görselleri mobil-safe wrapper'lara geçirildi.

## 6. Cache / invalidation

Aşağıdaki public içerik değişimleri content revision + Next revalidation tetikler:

- settings
- programs
- news
- events
- media
- pages
- documents
- teams / mentor team profile
- public staff/users
- member count changes
- approved team applications
- event registrations

## 7. Testler

Yeni scriptler:

- `npm run content:check`
- `npm run content:smoke -- https://www.recfturkiye.com`

V3.1.2 güvenlik testleri korunur.

## Migration

**Yok.** `content_revision`, mevcut `settings` key/value tablosunda ilk public mutation sırasında otomatik yazılır.
