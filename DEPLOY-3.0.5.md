# RECF Türkiye V3.0.5 — Production Update

Bu paket V3.0.4 üzerine uygulanabilir.

## 1) Supabase migration

Supabase Dashboard → SQL Editor → New Query içinde aşağıdaki dosyanın tamamını bir kez çalıştırın:

`supabase/repair-v3.0.5-registration.sql`

Bu migration mevcut satırları silmez; `district`, `kvkk_accepted`, `kvkk_accepted_at` alanlarını tamamlar.

## 2) Paketi mevcut repo üzerine aktar

```bash
cd ~/Downloads/recf-turkiye-production-ready
rm -rf /tmp/recf-v305
mkdir -p /tmp/recf-v305
unzip ~/Downloads/recf-turkiye-v3.0.5-registration-cms.zip -d /tmp/recf-v305

rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v305/recf-turkiye-v3.0.5-registration-cms/ ./
```

## 3) Yeni dependency + build

İl/ilçe listesi için yeni server-side veri dependency'si eklendi. Bu nedenle:

```bash
rm -rf .next node_modules
npm install
npm run typecheck
npm run build
```

## 4) Git / Vercel

```bash
git add -A
git commit -m "v3.0.5: registration UX + CMS image specs"
git push
```

Vercel GitHub entegrasyonu açıksa otomatik deploy başlar.

## 5) Smoke test

- `/kayit`: İl seç → yalnız o ile ait ilçeler gelsin.
- `/kayit`: KVKK işaretlenmeden gönder butonu aktif olmasın.
- `/kayit`: takım numarası yazarken tire/çizgi hareket etmesin.
- `/admin/programlar`: 1600×1200 önerisi görünsün.
- `/admin/etkinlikler`: 1600×900 önerisi görünsün.
- `/admin/haberler`: 1600×900 önerisi görünsün.
- `/admin/ayarlar`: hero 1600×1200 önerisi görünsün.
- `/admin/medya`: toplu görsel ölçü rehberi ve 1600×900 galeri önerisi görünsün.
- `/admin/ekip`: 800×800 önerisi görünsün.
- `/admin/takimlar`: 800×800 logo önerisi görünsün.

Yeni bir test başvurusu gönderildikten sonra Supabase `applications` tablosunda `district=true değer`, `kvkk_accepted=true` ve `kvkk_accepted_at` dolu olmalıdır.
