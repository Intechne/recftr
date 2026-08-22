# RECF Türkiye V3.1.0 — Security Hardening

Bu sürüm V3.0.9 üzerine gerçekleştirilen white-box kaynak kod incelemesi ve `www.recfturkiye.com` üzerinde kullanıcı tarafından çalıştırılan black-box TLS/header/API testlerinin bulgularını kapatır.

## Kritik düzeltmeler
- Public `/api/teams` artık mentor adı/e-posta/telefon döndürmez.
- Takım belgelerinde backend RBAC ve takım-path ownership doğrulaması eklendi.
- Session version ile kullanıcı pasifleştirme, rol/şifre/takım değişikliğinde oturum iptali eklendi.
- Production oturum cookie'si `__Host-` prefix kullanır; CMS TTL 4 saat, portal 8 saat.
- Başvuru takım numarası squatting engellendi; bekleyen başvuru artık numarayı kilitlemez.
- Başvuru onayı mevcut takımı `ON CONFLICT UPDATE` ile ezemez.
- CMS rolüyle çakışan mentor e-postasında başvuru onayı durdurulur.
- Login, başvuru, iletişim ve upload-sign için DB-backed rate limit eklendi; login account limiter e-posta+IP anahtarı kullanarak üçüncü taraf hesap kilitleme/DoS riskini azaltır.
- TOTP MFA desteği eklendi; bootstrap admin için `ADMIN_TOTP_SECRET`, CMS kullanıcıları için kullanıcı bazlı secret.
- Upload MIME zorunlu; uzantı/MIME eşleşmesi, bucket MIME limitleri, boyut ve Storage metadata doğrulaması eklendi.
- Private signed URL ömrü kısaltıldı ve takım prefix doğrulaması eklendi.
- Production API hataları internal PostgreSQL/Supabase detaylarını istemciye sızdırmaz.
- CSP, nosniff, frame protection, referrer policy, permissions policy, COOP/CORP ve diğer security header'ları eklendi.
- Finansal ayarlar yalnız `admin`; editor key-whitelist ile sınırlandı.
- Social/asset URL ayarlarında güvenli HTTPS scheme doğrulaması eklendi.
- Open redirect helper `//`, backslash ve CR/LF değerlerini reddeder.
- CMS tarafından girilen program/event/news/page/document alanlarına server-side uzunluk ve URL doğrulamaları eklendi.
- Public/private Storage URL/path doğrulaması Supabase origin'iyle sınırlandı.
- Temporary passwordlar güçlendirildi ve ilk girişte şifre değiştirme zorunlu hale getirildi.
- React/ReactDOM 19.2.8'e yükseltildi.

## Veritabanı
Zorunlu: `supabase/security-v3.1.0.sql`

Önerilen: `supabase/least-privilege-role-v3.1.0.sql` ile `postgres` yerine `recf_app` uygulama rolü.

## Test araçları
- `npm run security:static`
- `npm run security:smoke -- https://www.recfturkiye.com`
- `npm run security:smoke -- https://www.recfturkiye.com --rate-limit`

## Not
Bu paket oluşturulan ortamda npm registry erişimi olmadığı için `package-lock.json` ve gerçek `next build` üretilemedi. Network erişimi olan geliştirme makinesinde `npm install` ile lockfile oluşturulup commit edilmeli, ardından `npm run typecheck`, `npm run security:static` ve `npm run build` geçmeden production deploy yapılmamalıdır.
