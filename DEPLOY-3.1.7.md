# Deploy — v3.1.7

## Mevcut proje üzerine kurulum

```bash
cd ~/Downloads/recf-turkiye-production-ready

rm -rf /tmp/recf-v317
mkdir -p /tmp/recf-v317

unzip ~/Downloads/recf-turkiye-v3.1.7-all-programs-recf-api.zip \
  -d /tmp/recf-v317

rsync -av --delete \
  --exclude='.git' \
  --exclude='.vercel' \
  --exclude='.env.local' \
  --exclude='.env.production.local' \
  --exclude='.env.development.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='package-lock.json' \
  /tmp/recf-v317/recf-turkiye-v3.1.7-all-programs-recf-api/ ./

rm -rf .next
npm install
npm run typecheck
npm run security:static
npm run content:check
npm run stability:smoke
npm run build

git add -A
git commit -m "v3.1.7: RECF Games integration for all programs"
git push
```

## Environment

Zorunlu yeni environment variable yoktur. İsteğe bağlı:

```env
RECF_GAMES_API_BASE=https://games.recf.org
RECF_GAMES_REVALIDATE_SECONDS=900
```

## Deploy sonrası kontrol

- `/programlar/engage`: Tier Takeover puanlama ve interaktif hesaplayıcı.
- `/programlar/achieve`: Pinnacle puan kartları ve örnekleri.
- `/programlar/inspire`: Pinnacle puan kartları ve örnekleri.
- `/programlar/adc`: Fast Track pilotaj, otonom ve teamwork puanları.
- `/programlar/adc-pro`: mevcut CMS içeriği; public sayfada API durum mesajı yok.
- Hiçbir public program sayfasında `RECF API CANLI`, `API senkronu`, `doğrulanmış yedek` gibi sistem metni bulunmamalı.
