# RECF Türkiye V3.0.8 — Home Experience Revival

V3.0.7 responsive/CMS altyapısı korunarak full CMS öncesindeki ana sayfa hareket ve kompozisyon dili geri getirildi.

## Ana sayfaya geri dönen / geliştirilen parçalar
- Hareketli geometrik hero vurguları ve stagger giriş animasyonları
- CMS programlarından oluşan “Sezon Oyunları” paneli
- Eski plaka diline yakın program kartları + Reveal/hover hareketi
- SVG çizilme animasyonlu Sezon Rotası
- Veritabanından gerçek sayıları alan CountUp istatistik bandı
- Desktop/TV’de scoreboard-tablosu, mobilde kart satırı gibi çalışan etkinlik alanı
- Haber kartlarında görsel hover/reveal hareketleri
- CMS medya kütüphanesinden beslenen büyük galeri kompozisyonu; video varsa sessiz autoplay/loop
- Yüzen takım plakası CTA alanı

## CMS entegrasyonu
Site Ayarları > Ana Sayfa Deneyimi bölümünden:
- Hero ana başlık / cyan vurgu satırı
- Sezon etiketi
- Sezon Rotası başlığı
- Rota adımları (ay, açıklama, tamamlandı durumu)
- Alt CTA başlığı, açıklaması ve örnek takım plakası
- Programlar, rota, istatistik, etkinlik, haber, galeri ve CTA bölümlerinin görünürlüğü

yönetilebilir.

## Dinamik istatistikler
Yeni `/api/home-stats` endpoint’i Supabase’ten şu gerçek değerleri üretir:
- Aktif ve görünür takım sayısı
- Takımların bulunduğu farklı il sayısı
- Yayınlanmış etkinlik sayısı
- Aktif öğrenci/üye sayısı (mentor hariç)
- Aktif resmi program sayısı

## Responsive
- 320px telefonlardan 4K Smart TV’ye kadar V3.0.7 responsive temeli korunur.
- Sezon rotası desktop/TV’de yatay, mobil/tablette dikeydir.
- Scoreboard etkinlik alanı küçük ekranda karta dönüşür.
- Galeri 1/2/4 kolon düzenine akar.
- `prefers-reduced-motion` tüm ek hareketleri kapatır.

Veritabanı migration gerekmez; yeni ana sayfa ayarları mevcut `settings` key/value tablosunu kullanır.
