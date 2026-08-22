# RECF Türkiye V3.1.2 — Session Revocation Hotfix Deploy

Bu sürüm V3.1.1 üzerine küçük ve hedefli bir production hotfix'tir. **Yeni Supabase migration veya yeni environment variable gerektirmez.**

## 1. Paketi mevcut projeye geçir

```bash
cd ~/Downloads/recf-turkiye-production-ready
rm -rf /tmp/recf-v312
mkdir -p /tmp/recf-v312
unzip ~/Downloads/recf-turkiye-v3.1.2-session-revocation-hotfix.zip -d /tmp/recf-v312
rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  /tmp/recf-v312/recf-turkiye-v3.1.2-session-revocation-hotfix/ ./
```

## 2. Lokal gate

```bash
rm -rf .next
npm install
npm run typecheck
npm run security:static
npm run build
```

## 3. Push / deploy

```bash
git add -A
git commit -m "v3.1.2: fix session revocation user update SQL typing"
git push
```

Vercel deployment tamamlandıktan sonra diagnostics sürümü `3.1.2` görünmelidir.

## 4. Zararsız smoke

```bash
npm run security:smoke -- https://www.recfturkiye.com
```

## 5. Advanced RBAC / IDOR

Mevcut test env değişkenlerin açıksa:

```bash
npm run security:advanced -- https://www.recfturkiye.com
```

## 6. Session revocation final testi

Yalnız geçici editor test hesabını kullan:

```bash
npm run security:advanced -- https://www.recfturkiye.com --revocation
```

Beklenen revocation satırları:

```text
PASS  REVOCATION login — role=editor
PASS  Temporary test user disabled
PASS  Old session revoked after user disable
PASS  Temporary test user restored
PASS  Old session remains revoked after restore
```

`dbUser=postgres` bu verifier sürümünde exploit FAIL değil, defense-in-depth INFO olarak raporlanır.
