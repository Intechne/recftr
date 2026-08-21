# RECF Türkiye V3.0.4 Program Runtime Fix

- Program kayıtları DB katmanında normalize edilir.
- `chips`, `match_types`, `facts` JSON/string/null fark etmeksizin güvenli dizilere çevrilir.
- `cover_url` ve metin alanları güvenli string olarak işlenir.
- `/programlar` API cevabı hatalı olsa bile sayfa çökmeyecek.
- Program liste ve detay sayfasında bozuk içerik tüm siteyi error boundary'ye düşürmez.
- Kapak görseli yüklenemese dahi program içeriği render edilmeye devam eder.
