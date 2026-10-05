# Güncel kurallar ve mentor yönlendirmeleri

- Eylül 2026 Coach Academy başvuruları için bilinen eski duyuru, 1 Ekim Türkiye saati itibarıyla kamu bandından çıkarılır. Yeni CMS mesajları korunur; boş/bozuk bantta zamansız yönlendirmeler gösterilir. Veritabanı ayarları değiştirilmez.
- Kayan bant durdurulup devam ettirilebilir; yinelenen satır ekran okuyucudan gizlenir. Tarih filtresi sunucuda uygulanır, istemcinin saatine bağlı hidrasyon farkı yaratmaz.
- Mentor sayfasındaki geçmiş Eylül eğitim tarihi, teyitsiz görüşme/eğitim süreleri ve sertifika vaatleri kaldırılır. Mevcut takım ön başvuru formuna yönlendirilir; eğitim ve resmî kayıt ayrımı açıklanır.
- Engage ve Inspire doğrulanmış v2.0, ADC v1.1 kaynaklarını kullanır. Resmî API kesilse de teknik özet bağlantısı incelenmiş kılavuza gider.
- Inspire neutral goal ittifak halfpin değeri 7 puandır; sarı halfpin ve solo eşleşme koşulları açıklanır. ADC otonom süre 180 saniye ve seçili görev sınırları gösterilir.
- Puanlar metindeki yakın sayılardan çıkarılmaz; incelenmiş sürüme ait sınırlı özet kullanılır. Beş programda da farklı kılavuz sürümü geldiğinde eski özet/örnek/Engage hesaplayıcısı gösterilmez; yeni resmî kaynağa yönlendirilir. Bu özet tüm oyun kurallarını kapsamaz.
- Ana SEO açıklamasındaki takım numarası alma iddiası ön başvuru bilgisiyle değiştirilir.

## Kaynaklar (5 Ekim 2026)

- https://games.recf.org/engage/2.0 — §3.1
- https://games.recf.org/inspire/2.0 — §3.1, §5.1
- https://games.recf.org/adc/1.1 — §1.3, §3.1, §4.2, §5.1

## Doğrulama

İçerik regresyon testi: duyuru bitiş sınırı, yeni CMS mesajının korunması, bozuk/boş mesajlar, API kesintisi, beş programın yeni sürümde eski puanları gizlemesi, yanıltıcı metin sayılarının puanları bozmaması. Yerel içerik 23/23, güvenlik 27/27 ve Next.js derleme/tip kontrolü geçti. Önizleme ve canlı yayında ayrıca 34 kontrol ve tarayıcıda bant durdur/devam, Engage hesaplayıcı, mentor bağlantısı, masaüstü/mobil görünüm uygulanacak.

## Kalan işler

Kurumdan kesin eğitim/etkinlik tarihleri ve doğru Türkçe dosyalar bekleniyor. Diğer CMS metinleri ve kayıtlar ayrıca teyit edilmeli. Supabase RLS/MFA/Storage incelemesi kullanıcı tercihiyle ertelendi. E-posta DNS, hukuki metinler ve eksik manifest ikonları ayrı işlerdir; bunlar bu güncellemeyle çözülmüş sayılmaz.
