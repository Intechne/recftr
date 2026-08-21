# RECF Türkiye V3.0.2 — CMS + Storage Repair

Bu sürüm CMS kaydetme ve Supabase Storage hata görünürlüğünü güçlendirir.

## 1. Supabase repair SQL
Supabase > SQL Editor içinde `supabase/repair-v3.0.2.sql` dosyasını çalıştırın. SQL idempotenttir; mevcut takım/başvuru verilerini silmez.

## 2. Vercel environment variables
Production ortamında aşağıdakilerin bulunduğunu doğrulayın:

- `DATABASE_URL` veya `POSTGRES_URL`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SUPABASE_URL` (veya `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SECRET_KEY` (alternatif olarak `SUPABASE_SERVICE_ROLE_KEY`)

Environment değişikliklerinden sonra Redeploy gerekir.

## 3. Deploy sonrası tanılama
Admin hesabıyla CMS'e girin ve `/admin/sistem` sayfasını açın.

Aşağıdakilerin tamamı `OK` olmalı:
- Veritabanı
- Beklenen V3 tabloları
- Supabase Storage
- `recf-public` bucket
- `team-private` bucket
- `SESSION_SECRET`

## 4. Smoke test
1. CMS > Etkinlikler: görselsiz bir test etkinliği kaydedin.
2. CMS > Medya: küçük bir JPG/PNG yükleyin.
3. CMS > Haberler: yüklenen görselle test haberi kaydedin.
4. Supabase Table Editor'da `events`, `media`, `news` satırlarını doğrulayın.
5. Supabase Storage'da `recf-public` bucket içeriğini doğrulayın.

V3.0.2 ile API hataları JSON olarak CMS'e geri döner; artık Kaydet/Yükle işlemlerindeki gerçek Supabase/Postgres hata mesajı arayüzde görünür.
