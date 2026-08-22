# V3.0.9 Refined Icon Güncellemesi

Bu güncelleme yalnızca frontend component ve navigasyon eşlemelerini değiştirir. Supabase migration veya yeni environment variable gerekmez.

## 1. Paketi mevcut repo üzerine aktar

```bash
cd ~/Downloads/recf-turkiye-production-ready

rm -rf /tmp/recf-v309
mkdir -p /tmp/recf-v309
unzip ~/Downloads/recf-turkiye-v3.0.9-refined-icons.zip -d /tmp/recf-v309

rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v309/recf-turkiye-v3.0.9-refined-icons/ ./
```

## 2. Lokal kontrol

```bash
rm -rf .next
npm install
npm run typecheck
npm run build
```

## 3. GitHub / Vercel

```bash
git add -A
git commit -m "v3.0.9: integrate refined Figma icon system"
git push
```

Vercel otomatik deploy edecektir.

## 4. Smoke test
- `/` — ana sayfa ikonları ve CTA'lar
- `/dokumanlar` — kategori ikonları
- `/admin` — tüm CMS sidebar ikonları ve active state
- `/portal` — portal sidebar ikonları
- mobil menü — public navigation ikonları
- `/admin/sistem` — sürüm `3.0.9`
