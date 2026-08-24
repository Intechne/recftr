# RECF Türkiye V3.1.4 Deployment

## Acil durum
Production V3.1.3 sürekli 504 veriyorsa önce Vercel'de son stabil V3.1.2 deployment'ını **Promote to Production / Redeploy** ile geçici olarak geri alın. Veritabanına rollback/migration gerekmez.

## Kaynak kodu uygula

```bash
cd ~/Downloads/recf-turkiye-production-ready

rm -rf /tmp/recf-v314
mkdir -p /tmp/recf-v314

unzip ~/Downloads/recf-turkiye-v3.1.4-stability-hotfix.zip -d /tmp/recf-v314

rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='package-lock.json' \
  /tmp/recf-v314/recf-turkiye-v3.1.4-stability-hotfix/ ./
```

## Lokal gate

```bash
rm -rf .next
npm install
npm run typecheck
npm run security:static
npm run content:check
npm run build
```

Hepsi PASS ise:

```bash
git add -A
git commit -m "v3.1.4: fix Vercel serverless timeout and cache public reads"
git push
```

## Vercel
İlk V3.1.4 deployment'ında mümkünse build cache kullanmadan temiz redeploy yapın.

## Production doğrulama

```bash
npm run stability:smoke -- https://www.recfturkiye.com
npm run content:smoke -- https://www.recfturkiye.com
npm run security:smoke -- https://www.recfturkiye.com
npm run security:advanced -- https://www.recfturkiye.com
```

`.org` aynı siteyi yayınlıyorsa:

```bash
npm run stability:smoke -- https://www.recfturkiye.org
npm run content:smoke -- https://www.recfturkiye.org
```

## Beklenen
- `/` tekrar tekrar HTTP 200.
- `FUNCTION_INVOCATION_TIMEOUT` görülmemeli.
- Program/logo white plate ve mobil media fixleri korunmalı.
- CMS save sonrası cache tag invalidation ile yeni ziyaret güncel içerik görmeli.
- Aynı browser'da açık public sekme CMS mutasyonu sonrası reload olmalı.
