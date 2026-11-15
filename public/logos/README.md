# Gerçek logoları buraya ekleyin

Figma'daki orijinal logo dosyalarını şu adlarla bu klasöre koyun:

- recf-turkiye.png  → yatay RECF | TÜRKİYE lockup (nav ve footer)
- adc-white.png     → Aerial Drone Competition beyaz dikey logo (ADC sayfası)
- adc-color.png     → ADC yeşil yatay logo
- adc-pro.png       → ADC Pro renkli logo

Sonra components/Brand.tsx içindeki wordmark bileşenlerini
<img src="/logos/..."> ile değiştirin (yorum satırları hazır).

## Kamu ikonları — 5 Ekim 2026

`icon-512.png` ve `apple-touch-icon.png`, canlı CMS’deki resmî favicon (512 px) ve Apple ikonunun (180 px) değiştirilmeden alınan kopyalarıdır. `icon-192.svg`, aynı 512 px dosyayı kendi içinde taşıyan 192 px SVG görünümüdür; ayrı bir logo çizimi içermez. Manifest bağlantıları bu yerel dosyalara gider. Logo güncellenirse bu dosyalar da birlikte yenilenmelidir.

## Anlamlı adlı marka dosyaları — 15 Kasım 2026

- `recf-turkiye-logo.png` (1000 × 280) → CMS'teki yatay site logosunun (`site_logo`) değiştirilmeden alınan kopyası. Yapılandırılmış veride (Organization `logo`) ve CMS boşken varsayılan olarak kullanılır.
- `recf-turkiye-mark.png` (512 × 512) → CMS'teki kare marka işaretinin (`site_mark`) kopyası.
- `../og/recf-turkiye-og.png` (1200 × 630) → CMS paylaşım görselinin kopyası; kendi görseli olmayan tüm sayfaların Open Graph görseli.

CMS → Site Ayarları'ndan yüklenen marka görselleri artık Supabase Storage'a da anlamlı adlarla kaydedilir (`recf-turkiye-logo-…`, `recf-turkiye-mark-…`, `recf-turkiye-og-…`).
