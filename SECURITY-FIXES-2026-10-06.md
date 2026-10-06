# Güvenlik düzeltmeleri — 6 Ekim 2026

## Dağıtım öncesi

1. Supabase SQL Editor'da `supabase/security-session-revocation.sql` dosyasını uygulayın. Kod, oturumların iptal tablosu olmadan çalıştırılmamalı.
2. Güncel `package-lock.json` ile `npm ci`, `npm run typecheck`, `npm run build` çalıştırın.
3. Vercel dışı dağıtımda ters proxy'nin istemciden gelen IP başlığını silip kendisinin yazdığından emin olun. Sonra `TRUSTED_CLIENT_IP_HEADER` ayarlayın. Vercel bu başlığı kendi sınırında sağlar.
4. Üretimde HTTPS, HSTS, nonce'lu CSP, giriş, çıkış ve geçici şifre akışını kontrol edin.

## Davranış değişiklikleri

- `Origin` ve `Sec-Fetch-Site: same-origin` başlıklarının ikisi de yoksa değişiklik isteği reddedilir. Tarayıcı dışı istemciler `Origin` başlığını göndermelidir.
- Yeni veya sıfırlanmış şifreli CMS hesapları `/admin/sifre-degistir` üzerinden şifresini değiştirmeden diğer korumalı API'leri kullanamaz.
- Çıkış işlemi oturum belirtecini veritabanında iptal eder. Veritabanı erişilemezse çıkış hata verir ve kullanıcı tekrar deneyebilir.
- Depolanan dosyalar kayıt aşamasında MIME metaverisine ek olarak içerik imzasından doğrulanır.
- Tailwind 4'e geçildi; sayfa görünümü üretim öncesi incelenmelidir.
