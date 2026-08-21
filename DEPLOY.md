# V3.0.5 Production Update

Mevcut V3.0.4 production kurulumunda önce Supabase SQL Editor üzerinden `supabase/repair-v3.0.5-registration.sql` dosyasını bir kez çalıştırın. Bu migration `applications` tablosuna `district`, `kvkk_accepted`, `kvkk_accepted_at`; `teams` tablosuna `district` ekler ve mevcut satırları silmez.

V3.0.5 yeni bir il/ilçe veri dependency'si içerdiği için dosyaları repo üzerine aldıktan sonra `npm install` çalıştırılması zorunludur.

# V2 → V3 Production Upgrade

Bu akış mevcut GitHub/Vercel/Supabase kurulumunu koruyarak V3'e yükseltir.

## 1. Supabase migration

Önce Supabase Dashboard → SQL Editor → New Query açın ve:

`supabase/migration-3-complete-cms.sql`

 dosyasının tamamını çalıştırın.

Migration şunları ekler/günceller:

- program içerikleri
- CMS kullanıcı/rolleri ve public ekip profilleri
- etkinlik kayıtları
- medya
- belge gereksinimleri
- private takım evrakları
- ödemeler
- iletişim kayıtları
- audit log
- site ayarları ve kayıt ücretleri
- `recf-public` ve `team-private` Storage bucket'ları

## 2. Vercel environment variables

Mevcut değişkenlere ek olarak kesinlikle ekleyin:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
```

Tam set:

```text
DATABASE_URL
SUPABASE_URL
SUPABASE_SECRET_KEY
SESSION_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
```

`SUPABASE_SECRET_KEY` değeri Supabase → Project Settings / API Keys bölümündeki server-side secret key (`sb_secret_...`) olmalıdır.

## 3. V3 dosyalarını repo üzerine aktar

ZIP'i geçici klasöre açın. Örnek:

```bash
rm -rf /tmp/recf-v3
mkdir -p /tmp/recf-v3
unzip ~/Downloads/recf-turkiye-v3-complete.zip -d /tmp/recf-v3
```

Repo klasörüne girin:

```bash
cd ~/Downloads/recf-turkiye-production-ready
```

Mevcut `.git`, `.env.local` ve lokal cache'leri koruyarak V3'ü birebir senkronize edin:

```bash
rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v3/recf-turkiye-v3-complete/ ./
```

`--delete` önemlidir: V2'den kalan demo/SQLite/eski migration dosyalarını ve eski `package-lock.json` dosyasını kaldırır.

## 4. Yeni dependency lock oluştur ve build et

```bash
rm -rf node_modules .next
npm install
npm run typecheck
npm run build
```

Build temizse lokal test:

```bash
npm run dev
```

## 5. GitHub'a gönder

```bash
git status
git add -A
git commit -m "v3: complete CMS + team portal + Supabase Storage"
git push
```

Vercel GitHub entegrasyonu açıksa otomatik deployment başlar.

## 6. Vercel'de environment değiştiyse Redeploy

Environment variable'ları Git push'tan sonra eklediyseniz son deployment için yeniden deploy yapın.

## 7. Production smoke test

1. `/cms-giris` admin girişi
2. `/admin/programlar` program düzenleme
3. `/admin/etkinlikler` etkinlik oluştur + kapak yükle
4. `/admin/haberler` haber oluştur + kapak yükle
5. `/admin/medya` görsel yükle/sil
6. `/admin/dokumanlar` PDF yükle/sil
7. `/admin/belge-gereksinimleri` bir gereksinim ekle
8. `/kayit` test takım başvurusu
9. `/admin/onaylar` başvuruyu onayla, geçici mentor şifresini kaydet
10. `/giris` mentor hesabıyla giriş
11. `/portal/belgeler` private dosya yükle
12. `/admin/takim-belgeleri` belgeyi aç/onayla
13. `/portal/etkinlikler` etkinlik kaydı yap
14. `/admin/etkinlik-kayitlari` kaydı onayla ve pit ata
15. `/hakkimizda` iletişim formu gönder → `/admin/iletisim`

## Güvenlik notları

- `.env.local` Git'e eklenmez.
- `SUPABASE_SECRET_KEY` hiçbir `NEXT_PUBLIC_*` değişkeninde kullanılmaz.
- Takım belgeleri public URL taşımaz; süreli signed URL ile açılır.
- Public Storage yüklemeleri de yalnızca yetkili CMS/mentor oturumundan signed upload URL alabilir.
- Takım portalı sunucu tarafında session içindeki `teamNum` ile sınırlandırılır; istemciden başka takım numarası kabul edilmez.
