# RECF Türkiye V3.0.3 Runtime Hotfix

Bu sürüm V3.0.2 üzerinde client-side crash koruması ekler.

## Düzeltilen kritik hata
Public ana sayfa API endpoint'lerinden biri 4xx/5xx ile `{error: ...}` döndürdüğünde cevap doğrudan array state'ine atanıyordu. Render sırasında `.map()`, `.slice()` veya `.filter()` çağrısı client-side exception üretiyordu.

V3.0.3:
- `/api/programs`, `/api/events`, `/api/news`, `/api/media`, `/api/settings` cevaplarını runtime'da doğrular.
- API hatasında array state'lerini her zaman `[]`, object state'lerini `{}` olarak tutar.
- Public ana sayfa içerik servisi bozulsa bile render olmaya devam eder.
- Etkinlik listesi de güvenli array fetch kullanır.
- Public segment ve global error boundary eklendi.
- Gerçek API hataları browser console'a `[CLIENT API]` etiketiyle yazılır.

## Önemli
Bu hotfix API/DB hatasının kullanıcı sitesini çökertmesini engeller. CMS'nin kaydetmemesinin altyapı sebebi ayrıca düzeltilmelidir.
Deploy sonrası `/admin/sistem` sayfasını açın. DB ve Storage kartları OK olmalıdır.
Eksik tablolar görünüyorsa `supabase/repair-v3.0.2.sql` Supabase SQL Editor'de çalıştırılmalıdır.
