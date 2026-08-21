# RECF Türkiye V3.0.6

## Tasarım sistemi
- Figma `🔷 İkon Paketi` (node 87:2) görsel dili uygulamaya taşındı.
- Web sitesi, CMS ve takım portalındaki navigasyon/görsel emoji ikonları kaldırıldı.
- Solid-duotone, koyu mürekkep + cyan vurgu, pahlı köşe dilinde `FigmaIcon` bileşeni eklendi.
- CMS menüsü, portal menüsü, duyuru şeridi, bilgi kartları, dokümanlar ve temel arayüz göstergeleri yeni ikon setini kullanıyor.

## Dokümanlar
- CMS öncesi sürümdeki üst kategori kartı filtre tasarımı geri getirildi.
- Kartlar artık canlı CMS kategorilerini ve dosya sayılarını gösteriyor.
- Arama ve dinamik doküman listesi korunuyor.

## Marka yönetimi
CMS > Site Ayarları altında artık aşağıdakiler yönetilebilir:
- Web sitesi ana logosu
- Kare marka işareti
- Favicon / web sitesi ikonu
- Apple Touch Icon
- Open Graph sosyal paylaşım görseli
- Site adı

Ana logo header ve footer'da otomatik kullanılır. Logo yoksa marka işareti + site adı fallback'i gösterilir.
Favicon, Apple icon ve Open Graph metadata CMS değerlerinden üretilir.
