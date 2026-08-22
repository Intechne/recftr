# RECF Türkiye — Birleştirilmiş Penetrasyon Testi ve Düzeltme Raporu
**Sürüm:** V3.1.0 Security Hardening  
**Tarih:** 22 Ağustos 2026  
**Kapsam:** V3.0.9 kaynak kodu + `www.recfturkiye.com` production edge/API testleri  
**Test modeli:** Yetkili, zarar vermeyen white-box + black-box doğrulama

## 1. Yönetici özeti

V3.0.9 üzerinde yapılan incelemede dört yüksek riskli uygulama açığı, çeşitli orta/düşük riskli hardening eksikleri ve canlı ortamda eksik güvenlik header'ları tespit edildi. Canlı test ayrıca public takım API'sinin mentor kişisel verilerini gerçekten anonim istemcilere verdiğini doğruladı.

V3.1.0 paketinde doğrulanmış uygulama açıklarının tamamı için kod düzeltmesi hazırlandı. İki güvenlik adımı kod deploy'undan ayrı operasyon gerektirir: `recf_app` least-privilege DB rolüne geçiş ve MFA'nın mevcut ayrıcalıklı hesaplarda etkinleştirilmesi. Bunlar deployment rehberinde zorunlu/önerilen kapatma adımları olarak işaretlenmiştir.

**Önemli:** Bu rapordaki “DÜZELTİLDİ” durumu V3.1.0 kaynak paketini ifade eder. Production, V3.1.0 deploy + SQL/env adımları ve post-deploy smoke test tamamlanana kadar eski açıkları taşımaya devam eder.

## 2. Canlı black-box test sonucu

| Kontrol | V3.0.9 production sonucu | Durum |
|---|---|---|
| DNS | `www`: 64.29.17.1 / 64.29.17.65 | PASS |
| HTTP → HTTPS | 308 | PASS |
| Apex → www canonical | 308 | PASS |
| HTTP/2 | Aktif | PASS |
| HSTS | `max-age=63072000` | PASS |
| TLS 1.2 | Aktif, yalnız güçlü AEAD cipher'lar | PASS |
| TLS 1.3 | Aktif, güçlü cipher'lar | PASS |
| Vercel edge IP #1 | Nmap minimum strength A | PASS |
| Vercel edge IP #2 | Nmap minimum strength A | PASS |
| Sertifika | Let's Encrypt, verification OK | PASS |
| `/admin` anonim | Login'e yönlendiriliyor | PASS |
| `/api/system/diagnostics` anonim | 401 | PASS |
| CSP | Yok | FAIL → V3.1.0'da eklendi |
| X-Content-Type-Options | Yok | FAIL → V3.1.0'da eklendi |
| X-Frame-Options / frame-ancestors | Yok | FAIL → V3.1.0'da eklendi |
| Referrer-Policy | Yok | FAIL → V3.1.0'da eklendi |
| Permissions-Policy | Yok | FAIL → V3.1.0'da eklendi |
| Public `/api/teams` PII | Mentor ad/e-posta/telefon canlıda döndü | CONFIRMED HIGH |
| WAF fingerprint | WAFW00F Python SSL EOF nedeniyle sonuçsuz | INCONCLUSIVE |

WAFW00F hatası sitenin down olduğunu kanıtlamaz; aynı anda curl/OpenSSL/Nmap başarılıdır. WAF var/yok kararı bu testten çıkarılmamıştır.

## 3. Bulgular ve V3.1.0 düzeltmeleri

### H01 — Public takım API'sinde kişisel veri ifşası — HIGH — DÜZELTİLDİ
**Önce:** `/api/teams` `SELECT *` ile `mentor_name`, `mentor_email`, `phone` döndürüyordu; production'da doğrulandı.  
**Sonra:** Public sorgu explicit whitelist: `num,name,school,city,district,program,status,slogan,logo_url`. Private tam liste yalnız approvals/admin rollerine açık.

### H02 — Backend RBAC / private takım belgesi erişimi — HIGH — DÜZELTİLDİ
**Önce:** UI menüsü rolü gizlese bile backend `cmsSession()` ile editor'a takım belgeleri/signed URL erişimi verebiliyordu.  
**Sonra:** Team-doc GET/PATCH/DELETE `docsSession` (`admin/approvals/technical`) ile korunuyor; mentor yalnız kendi takımına erişiyor. Private signed URL 5 dakika ve path ownership zorunlu.

### H03 — Session revocation yok — HIGH — DÜZELTİLDİ
**Önce:** Kullanıcı pasifleştirme, rol/şifre/takım değişikliği mevcut 8 saatlik tokenı iptal etmiyordu.  
**Sonra:** `cms_users.session_version`; her private API çağrısında DB active/role/team/version revalidation. Şifre/rol/takım değişimi version artırıyor. Bootstrap admin session version, mevcut `ADMIN_PASSWORD` hash'ine bağlı. Production cookie `__Host-recf_session`.

### H04 — Team number squatting — HIGH — DÜZELTİLDİ
**Önce:** Anonim pending başvuru numarayı kilitleyebiliyordu.  
**Sonra:** Yalnız onaylı `teams` numarayı reserve eder. Pending başvurular gerçek başvuruyu engellemez. Aynı email+num 24 saat içinde draft refresh olur. Başvuruda IP/e-mail rate limit + honeypot eklendi.

### M01 — Login brute force / credential stuffing savunması yetersiz — MEDIUM — DÜZELTİLDİ + MFA OPERASYON ADIMI
- IP: 20 / 15 dk
- Hesap+IP: 8 / 15 dk (tek bir saldırganın global hesap kilidi oluşturmasını önler)
- Generic login hatası
- Timing farkını azaltmak için dummy scrypt verify
- TOTP MFA desteği
- CMS 4 saat, portal 8 saat session TTL

**Operasyon:** Mevcut CMS hesaplarında MFA admin panelinden etkinleştirilmeli; bootstrap admin için `ADMIN_TOTP_SECRET` eklenmeli.

### M02 — Upload MIME/uzantı bypass — MEDIUM — DÜZELTİLDİ
MIME artık zorunlu; extension↔MIME eşleşmesi, boyut, bucket-level allowed MIME, upload sonrası Storage metadata kontrolü bulunuyor. HTML/SVG executable içerik public upload allowlist'inde yok.

### M03 — Private file-path ownership yetersiz — MEDIUM — DÜZELTİLDİ
`teams/<session-team>/documents/` prefix doğrulaması hem kayıt hem download/delete akışında server-side uygulanıyor.

### M04 — Internal backend error disclosure — MEDIUM — DÜZELTİLDİ
Production API cevaplarında exception/Postgres/Supabase detayları yerine generic hata + server-side log kullanılıyor.

### M05 — Security header eksikleri — MEDIUM — DÜZELTİLDİ
Eklendi: CSP, `X-Content-Type-Options:nosniff`, `X-Frame-Options:DENY`, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, COOP, CORP, DNS prefetch off, Origin-Agent-Cluster.

### M06 — Editor finansal ayar değiştirebiliyordu — MEDIUM — DÜZELTİLDİ
Settings allowlist eklendi. Finansal kayıt ücretleri/kit/indirim/kayıt açık-kapalı anahtarları yalnız admin.

### M07 — Uygulama DB bağlantısı `postgres` superuser — MEDIUM — KOD/SQL HAZIR, OPERASYON GEREKLİ
`recf_app` NOSUPERUSER/NOCREATEDB/NOCREATEROLE rol scripti eklendi; explicit table grants + RLS policy. Production `DATABASE_URL` bu role geçirilmeli. `/admin/sistem` bunu kontrol eder.

### M08 — Başvuru onayında mevcut takımın overwrite edilmesi — MEDIUM — DÜZELTİLDİ
Eski `ON CONFLICT(num) DO UPDATE` kaldırıldı. Onay sırasında numara kullanılıyorsa 409 ile durur; mevcut takım verisi asla ezilmez. Mentor e-postası mevcut CMS admin/editor vb. role aitse de onay durur.

### L01 — `next` parametresinde protocol-relative redirect — LOW — DÜZELTİLDİ
`safeInternalPath()` `//`, backslash ve CR/LF reddeder.

### L02 — Form/API alan uzunlukları — LOW — DÜZELTİLDİ
Global mutation body limiti 512 KB; kritik form ve CMS alanlarında field-specific max-length ve server-side normalizasyon eklendi.

### L03 — Lockfile yok — LOW/SUPPLY CHAIN — DEPLOYMENT GATE
Kod ortamında npm registry erişimi olmadığı için güvenilir transitive lockfile üretilemedi. Network erişimi olan geliştirme makinesinde `npm install` ile `package-lock.json` oluşturulmalı ve **production deploy'dan önce commit edilmelidir**. `npm ci` daha sonra zorunlu kullanılmalıdır.

### L04 — Temporary password / audit lifecycle — LOW — DÜZELTİLDİ
Geçici parola entropisi artırıldı; yeni/reset hesapta `must_change_password=true`; mentor ilk şifre değişiminden sonra session revoke edilip yeniden login edilir. Login/MFA/password/user/application vb. kritik aksiyonlar audit log'a yazılır.

## 4. Ek hardening
- Public Supabase URL parser artık yalnız configured Supabase origin'ini kabul eder.
- Social/site asset URL settings yalnız güvenli HTTPS scheme kabul eder.
- API mutation'larında same-origin / `Sec-Fetch-Site` CSRF guard.
- API cevapları `private, no-store`; sensitive cache riski azaltıldı.
- Storage public/private bucket boyut ve MIME limitleri server tarafında enforce edilir.
- `serverExternalPackages` yalnız postgres; `X-Powered-By` kapalı.
- Source taramasında `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write`, `sql.unsafe` bulunmadı.
- SQL sorguları tagged-template parametreleme kullanıyor; belirgin SQL injection sink'i bulunmadı.

## 5. TLS/edge değerlendirmesi
TLS katmanında düzeltme gerektiren bir bulgu yok. Her iki Vercel edge IP'si TLS 1.2/1.3 ve Nmap A seviyesinde cipher'lar sundu. Sertifika zinciri doğrulandı. Uygulama güvenliği TLS'den daha yüksek öncelikliydi.

## 6. WAF durumu
WAFW00F 2.4.2, Python 3.14/OpenSSL bağlantısında `UNEXPECTED_EOF_WHILE_READING` hatası verdi. Bu nedenle WAF fingerprint sonucu **inconclusive**. V3.1.0 uygulama katmanı auth/rate-limit/input/CSRF kontrollerini WAF'tan bağımsız uygular. Vercel Firewall/managed rules ayrı bir defense-in-depth katmanı olarak panelden etkinleştirilebilir; bu raporda WAF mevcut/yok diye varsayım yapılmamıştır.

## 7. V3.1.0 statik güvenlik regresyon testi
Paket içindeki `npm run security:static` şu kontrolleri kapsar:
- PII whitelist
- team-doc RBAC
- session version/revocation
- `__Host-` cookie
- generic errors
- MIME/path/origin validation
- security headers
- CSRF guard
- body cap
- DB rate limit
- number squatting / approval overwrite
- financial RBAC
- URL scheme validation
- open redirect guard
- temporary password lifecycle
- TOTP support
- rate-limit table RLS
- patched React version

Artifact oluşturma ortamında: **23/23 PASS**, **104 TS/TSX dosyada 0 syntax error**, **0 kırık internal import**.

## 8. Production kapanış kriterleri
Açıklar ancak aşağıdaki bütün adımlar tamamlandığında production için CLOSED kabul edilmelidir:
1. `supabase/security-v3.1.0.sql` çalıştırıldı.
2. V3.1.0 deploy edildi.
3. `SESSION_SECRET` ≥32 karakter; `RATE_LIMIT_SALT` eklendi.
4. `recf_app` role geçildi ve diagnostics `leastPrivilege=true` gösteriyor.
5. Bootstrap/CMS ayrıcalıklı hesaplarında MFA etkin.
6. `package-lock.json` oluşturulup commit edildi; `npm ci`, typecheck ve build geçiyor.
7. `npm run security:smoke -- https://www.recfturkiye.com` tamamen PASS.
8. Kontrollü rate-limit smoke testi 429 üretiyor.
9. Live `/api/teams` artık mentor PII içermiyor.
10. Live response header'larında CSP/nosniff/frame/referrer/permissions bulunuyor.
