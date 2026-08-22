# V3.0.8 Ana Sayfa Deneyimi Güncellemesi

Bu güncelleme Supabase schema migration gerektirmez. Mevcut V3.0.7 verileri ve environment variable’ları korunur.

## 1. Paketi mevcut repoya aktar
```bash
cd ~/Downloads/recf-turkiye-production-ready
rm -rf /tmp/recf-v308
mkdir -p /tmp/recf-v308
unzip ~/Downloads/recf-turkiye-v3.0.8-home-experience.zip -d /tmp/recf-v308

rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v308/recf-turkiye-v3.0.8-home-experience/ ./
```

## 2. Lokal doğrulama
```bash
rm -rf .next
npm install
npm run typecheck
npm run build
```

## 3. Push
```bash
git add -A
git commit -m "v3.0.8: restore CMS-driven homepage experience"
git push
```

Vercel otomatik deploy eder.

## 4. Deploy sonrası kontrol
- `/` — Hero, program plakaları, Sezon Rotası, istatistik, etkinlik, haber, galeri, CTA
- `/admin/ayarlar` — “Ana Sayfa Deneyimi & Sezon Rotası” bölümü
- `/api/home-stats` — JSON istatistik cevabı
- `/admin/sistem` — sürüm 3.0.8 ve DB/Storage sağlık durumu

## Responsive test ölçüleri
- 360×800 / 390×844 — telefon
- 768×1024 — tablet portrait
- 1180×820 — tablet landscape
- 1366×768 / 1440×900 — laptop/desktop
- 1920×1080 — Full HD TV
- 3840×2160 — 4K TV
