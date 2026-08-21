# RECF Türkiye V3.0.5 — Registration + CMS Image Guidance

## CMS görsel ölçüleri

CMS içindeki tüm web görseli yükleme alanlarında ilgili kullanım alanına göre piksel önerisi görünür:

| Kullanım | Önerilen ölçü | Oran |
|---|---:|---:|
| Program kapak görseli | 1600 × 1200 px | 4:3 |
| Etkinlik kapak görseli | 1600 × 900 px | 16:9 |
| Haber / duyuru kapak görseli | 1600 × 900 px | 16:9 |
| Ana sayfa hero görseli | 1600 × 1200 px | 4:3 |
| Medya / galeri fotoğrafı | 1600 × 900 px | 16:9 |
| Medya / galeri videosu | 1920 × 1080 px | 16:9 |
| Ekip profil fotoğrafı | 800 × 800 px | 1:1 |
| Takım logosu | 800 × 800 px | 1:1 |

## Takım kayıt formu

- Mentor placeholder'ı `İsim Soyisim` olarak değiştirildi.
- İl ve ilçe iki ayrı select alanıdır.
- İlçe listesi seçilen ile göre dinamik yüklenir.
- İl / ilçe eşleşmesi API tarafında da doğrulanır.
- İlçe verisi server-side Türkiye il/ilçe veri paketinden alınır; tam veri browser bundle'ına eklenmez.
- KVKK Aydınlatma Metni onayı zorunludur; hem UI hem API doğrulaması vardır.
- KVKK kabul bilgisi ve zamanı `applications` tablosuna kaydedilir.
- Takım numarası alanındaki hareket eden tire/dash placeholder kaldırıldı. Alan yalnızca kullanıcının girdiği harf/rakamları gösterir.
- Takım numarası `A-Z / 0-9`, 2–10 karakter olarak doğrulanır.
- `district` alanı başvuru onayında `teams` tablosuna da aktarılır.

## Mevcut production veritabanı

Supabase SQL Editor'da bir kez çalıştırın:

`supabase/repair-v3.0.5-registration.sql`

Mevcut kayıtları silmez.
