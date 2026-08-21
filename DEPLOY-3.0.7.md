# V3.0.7 Responsive Güncelleme

Bu sürüm V3.0.6 üzerine uygulanır ve Supabase migration gerektirmez.

## 1. Repo üzerine aktar

```bash
cd ~/Downloads/recf-turkiye-production-ready
rm -rf /tmp/recf-v307
mkdir -p /tmp/recf-v307
unzip ~/Downloads/recf-turkiye-v3.0.7-responsive.zip -d /tmp/recf-v307
rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v307/recf-turkiye-v3.0.7-responsive/ ./
```

## 2. Lokal doğrulama

```bash
rm -rf .next
npm install
npm run typecheck
npm run build
```

## 3. GitHub / Vercel

```bash
git add -A
git commit -m "v3.0.7: responsive multi-device support"
git push
```

Vercel otomatik deploy eder. Environment variable veya Supabase ayarı değişmez.

## Önerilen cihaz testleri
- 320×568 — küçük telefon
- 375×812 / 390×844 — modern iPhone
- 412×915 — Android telefon
- 768×1024 — tablet portrait
- 1024×768 / 1180×820 — tablet landscape
- 1366×768 — laptop
- 1440×900 — desktop
- 1920×1080 — Full HD / Smart TV
- 2560×1440 — QHD
- 3840×2160 — 4K TV / büyük ekran

Chrome DevTools → Toggle Device Toolbar ile ilk sekiz senaryoyu kontrol edebilirsiniz. TV tarafında ayrıca Tab/Shift+Tab ile odak görünürlüğünü test edin.
