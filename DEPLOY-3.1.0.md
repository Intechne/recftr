# RECF Türkiye V3.1.0 — Security Hardening Deployment Rehberi

Bu sürüm V3.0.9 üzerine güvenlik düzeltmeleri uygular. **Production deploy öncesi aşağıdaki sırayı bozmayın.**

## 0. Kapsam

V3.1.0 aşağıdaki doğrulanmış/tespit edilmiş riskleri kapatır:

- Public `/api/teams` mentor PII sızıntısı
- Private takım belgelerinde backend RBAC / ownership eksikleri
- Session revocation eksikliği
- Takım numarası squatting ve onay sırasında mevcut takım overwrite riski
- Login / başvuru / iletişim / upload-sign rate limit eksikleri
- MFA eksikliği
- Upload MIME/uzantı/path doğrulama eksikleri
- Production API internal hata sızıntısı
- CSP ve temel security header eksikleri
- Finansal settings yetkilendirme problemi
- Open redirect / URL validation / body-size hardening
- Aşırı yetkili `postgres` uygulama DB rolü için least-privilege geçiş planı

TLS 1.2/1.3, sertifika, HTTPS redirect ve iki Vercel edge IP cipher taraması önceki canlı testlerde PASS durumundadır.

---

## 1. Production yedeği

Supabase Dashboard üzerinden production veritabanının güncel backup durumunu kontrol edin. Migration mevcut verileri silmez; buna rağmen production şema değişikliği öncesi yedek doğrulaması yapın.

Vercel'deki mevcut environment variable değerlerini de güvenli bir yerde doğrulayın. Secret değerleri GitHub'a veya bu repo içine koymayın.

---

## 2. Zorunlu Supabase migration

Supabase → SQL Editor içinde önce şunu çalıştırın:

```text
supabase/security-v3.1.0.sql
```

Bu migration:

- `cms_users.session_version`
- `cms_users.must_change_password`
- `cms_users.mfa_secret`
- `security_rate_limits`
- RLS / anon-authenticated revoke hardening

alanlarını ekler.

Migration tekrar çalıştırılabilir.

### Migration sonrası hızlı kontrol

SQL Editor:

```sql
select column_name
from information_schema.columns
where table_schema='public'
  and table_name='cms_users'
  and column_name in ('session_version','must_change_password','mfa_secret')
order by column_name;

select to_regclass('public.security_rate_limits');
```

İlk sorgu 3 satır, ikinci sorgu `security_rate_limits` döndürmelidir.

> V3.0.9 oturumları yeni token formatında `session_version` bulunmadığı için deploy sonrasında geçersiz olacaktır. Kullanıcıların yeniden giriş yapması beklenen davranıştır.

---

## 3. Vercel environment variables

Vercel → Project → Settings → Environment Variables altında production için en az:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SESSION_SECRET=EN_AZ_32_KARAKTER_RASTGELE_DEGER
RATE_LIMIT_SALT=AYRI_RASTGELE_DEGER
ADMIN_EMAIL=...
ADMIN_PASSWORD=UZUN_BENZERSIZ_SIFRE
ADMIN_TOTP_SECRET=BASE32_TOTP_SECRET
```

Yeni random değer üretmek için:

```bash
openssl rand -hex 32
```

`SESSION_SECRET` ve `RATE_LIMIT_SALT` **farklı** değerler olmalıdır.

### Bootstrap admin MFA

`ADMIN_TOTP_SECRET` opsiyonel kod desteğidir ancak production admin hesabında etkinleştirilmesi önerilir. Base32 TOTP secret'ı kullandığınız Authenticator uygulamasına ekledikten sonra aynı secret'ı Vercel'e girin.

MFA etkinleştirmeden önce Authenticator kodunun çalıştığını bir preview deployment üzerinde test edin.

---

## 4. Kaynak kodu mevcut projeye aktar

ZIP Downloads klasöründeyse:

```bash
cd ~/Downloads/recf-turkiye-production-ready

rm -rf /tmp/recf-v310
mkdir -p /tmp/recf-v310

unzip ~/Downloads/recf-turkiye-v3.1.0-security-hardening.zip -d /tmp/recf-v310
```

Ardından:

```bash
rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v310/recf-turkiye-v3.1.0-security-hardening/ ./
```

---

## 5. Node + dependency gate

V3.1.0 `Node 24.x` hedefler.

```bash
node -v
npm -v
```

Node 24 kullanmıyorsanız nvm ile:

```bash
nvm install 24
nvm use 24
```

Bu paketin oluşturulduğu ortamda npm registry bağlantısı timeout verdiği için güvenilir `package-lock.json` üretilemedi. **Production deploy öncesi kendi network erişimli makinenizde lockfile oluşturun ve commit edin.**

İlk kez:

```bash
rm -rf node_modules .next
npm install
```

Sonraki build/deploy'larda:

```bash
npm ci
```

Dependency audit:

```bash
npm audit --omit=dev
```

High/Critical bulgu varsa production deploy'u durdurup önce değerlendirin.

---

## 6. Local security/build gate

Aşağıdakilerin tamamı başarılı olmadan push etmeyin:

```bash
npm run typecheck
npm run security:static
npm run build
```

İsteğe bağlı local çalıştırma:

```bash
npm run dev
```

Kontrol:

- `/cms-giris`
- `/admin/sistem`
- `/admin/ekip`
- `/giris`
- `/portal`
- `/kayit`
- public `/takimlar`

---

## 7. Git / Vercel deploy

```bash
git add -A
git commit -m "v3.1.0: security hardening"
git push
```

Vercel deploy bitene kadar production smoke test çalıştırmayın.

---

## 8. İlk post-deploy kontrol

Önce zararsız smoke test:

```bash
npm run security:smoke -- https://www.recfturkiye.com
```

Beklenen tüm kontroller `PASS` olmalı.

Sonra edge/TLS/header testi:

```bash
npm run security:edge -- https://www.recfturkiye.com
```

Bu script `curl`, `openssl` ve mevcutsa `nmap`/`wafw00f` kullanır. `wafw00f` SSL EOF verirse script bunu **INCONCLUSIVE** kabul eder; site down sonucu çıkarmaz.

### Kontrollü login rate-limit doğrulaması

Bu test yalnız sahte bir hesap için en fazla 10 invalid login isteği yapar:

```bash
npm run security:smoke -- https://www.recfturkiye.com --rate-limit
```

`Login account rate limit activates` → `PASS` beklenir.

Test tamamlandıktan sonra yaklaşık 15 dakika içinde limiter penceresi kendiliğinden sona erer.

---

## 9. Kritik manuel smoke kontrolleri

### Public takım API PII

```bash
curl -s https://www.recfturkiye.com/api/teams
```

Response içinde **olmamalı**:

```text
mentor_name
mentor_email
phone
```

### Security headers

```bash
curl -sS -D - -o /dev/null https://www.recfturkiye.com/ | \
grep -Ei 'content-security|strict-transport|x-content|x-frame|referrer|permissions|cross-origin|origin-agent|dns-prefetch'
```

En az:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy`
- `Permissions-Policy`

beklenir.

### Anonymous diagnostics

```bash
curl -i https://www.recfturkiye.com/api/system/diagnostics
```

Beklenen: `401`.

### Cross-site mutation guard

```bash
curl -i \
  -X POST \
  -H 'Origin: https://evil-example.com' \
  -H 'Content-Type: application/json' \
  --data '{"email":"x@example.invalid","pass":"x","scope":"cms"}' \
  https://www.recfturkiye.com/api/auth
```

Beklenen: `403 Cross-site işlem reddedildi.`

---

## 10. Least-privilege DB rolüne geçiş — güçlü şekilde önerilir

İlk deploy'u mevcut DB credential ile doğruladıktan sonra Supabase SQL Editor'da:

```text
supabase/least-privilege-role-v3.1.0.sql
```

çalıştırın.

Sonra güçlü parola üretin:

```bash
openssl rand -base64 36
```

Supabase SQL Editor'da **ürettiğiniz gerçek parola ile**:

```sql
ALTER ROLE recf_app WITH PASSWORD 'BURAYA_UZUN_RASTGELE_PAROLA';
```

Parolayı repo veya chat/loglara koymayın.

Vercel `DATABASE_URL` değerini `recf_app` kullanacak şekilde değiştirin. Transaction pooler örneği:

```text
postgresql://recf_app.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:6543/postgres
```

> Gerçek pooler host/region bilgisini Supabase → Connect ekranından alın; örneği körlemesine kullanmayın.

Vercel'i redeploy edin ve CMS → **Sistem Tanılama** ekranında:

```text
security.leastPrivilegeDb = true
```

olduğunu doğrulayın.

Ardından tekrar:

```bash
npm run security:smoke -- https://www.recfturkiye.com
```

---

## 11. CMS kullanıcı MFA geçişi

CMS → **Ekip & Yetkiler** ekranında admin/editor/approvals/technical hesapları için MFA açın veya MFA anahtarını yenileyin.

- Kurulum anahtarını kullanıcıya yalnız güvenli kanal ile iletin.
- Kullanıcı Authenticator'a ekledikten sonra giriş testi yapın.
- MFA secret'ını e-posta, Slack public kanal veya dokümana koymayın.
- Mentor MFA bu sürümde zorunlu değildir.

---

## 12. Storage doğrulaması

CMS → Sistem Tanılama içinde:

- `recf-public`: public, 50 MB limit, MIME allowlist
- `team-private`: private, 20 MB limit, MIME allowlist

beklenir.

Takım portalından test PDF yükleyin, CMS'ten açın, ardından başka takım hesabının aynı path'e erişemediğini doğrulayın.

---

## 13. Rollback

Kod rollback gerekiyorsa Vercel'de önceki V3.0.9 deployment'a geri dönebilirsiniz. Ancak V3.1.0 migration'ının eklediği kolonları/tabloyu **silmeniz gerekmez**; backward-compatible'dır.

`recf_app` geçişinden sonra bağlantı problemi yaşarsanız geçici olarak önceki `DATABASE_URL` değerine dönüp redeploy edebilirsiniz; problemi çözdükten sonra least-privilege role tekrar geçin.

---

## 14. Production kapanış kriterleri

V3.1.0 güvenlik çalışması ancak şu maddelerin tümü sağlandığında kapanmış kabul edilmelidir:

1. `security-v3.1.0.sql` production'da çalıştı.
2. `npm run typecheck`, `npm run security:static`, `npm run build` PASS.
3. `package-lock.json` oluşturuldu ve Git'e commit edildi.
4. `/api/teams` mentor PII döndürmüyor.
5. Security header smoke testi PASS.
6. Anonymous diagnostics 401.
7. Cross-site mutation 403.
8. Login rate-limit smoke 429 üretiyor.
9. `recf_app` least-privilege DB rolü aktif ve `/admin/sistem` bunu doğruluyor.
10. Ayrıcalıklı CMS hesaplarında MFA etkin.
11. Storage bucket MIME/size politikaları doğru.
12. Production fonksiyonel smoke testleri (kayıt, CMS CRUD, portal belge/etkinlik) geçiyor.

Ayrıntılı bulgu/fix matrisi için `SECURITY-REPORT-V3.1.0.md` dosyasına bakın.
