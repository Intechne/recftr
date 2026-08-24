# RECF Türkiye V3.1.3 Deployment

## Amaç

V3.1.3 üç production problemini kalıcı olarak çözer:

1. CMS değişikliklerinin bazen görünmemesi / eski içeriğin geri gelmesi
2. Program logo/görsellerinin detay sayfasında koyu arka planda kötü görünmesi
3. Mobilde CMS görsellerinin kart/kutu dışına taşması

Supabase migration **yoktur**.

---

## 1. Paketi mevcut projeye aktar

```bash
cd ~/Downloads/recf-turkiye-production-ready

rm -rf /tmp/recf-v313
mkdir -p /tmp/recf-v313

unzip ~/Downloads/recf-turkiye-v3.1.3-content-consistency.zip \
  -d /tmp/recf-v313

rsync -av --delete \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='package-lock.json' \
  /tmp/recf-v313/recf-turkiye-v3.1.3-content-consistency/ ./
```

`package-lock.json` mevcutsa korunur. Yoksa `npm install` sonrasında oluşanı commit edin.

---

## 2. Temiz local doğrulama

```bash
rm -rf .next
npm install
npm run typecheck
npm run security:static
npm run content:check
npm run build
```

Dördü de geçmeden production push yapmayın.

---

## 3. GitHub / Vercel

```bash
git add -A
git commit -m "v3.1.3: permanent CMS consistency and responsive media fix"
git push
```

İlk V3.1.3 deployment'ında Vercel'de bir kez **Redeploy without existing Build Cache** kullanmak önerilir.

---

## 4. Production content smoke

`.com`:

```bash
npm run content:smoke -- https://www.recfturkiye.com
```

`.org` aynı projeyi yayınlıyorsa ayrıca:

```bash
npm run content:smoke -- https://www.recfturkiye.org
```

Beklenen: bütün satırlar `PASS`.

Ardından güvenlik regresyonu:

```bash
npm run security:smoke -- https://www.recfturkiye.com
npm run security:advanced -- https://www.recfturkiye.com
```

---

## 5. CMS → public canlı senkron testi

1. Bir sekmede `/admin/ayarlar`, başka sekmede public siteyi açın.
2. Ticker veya hero metnini değiştirip kaydedin.
3. Public sekmeye dönün.
4. Sekme focus aldığında content revision kontrolü yapılır; yeni sürüm varsa sayfa otomatik yenilenir.
5. Public sayfada hard-coded eski içerik flash/fallback görülmemelidir.

### 2 CMS sekmesi conflict testi

1. Site Ayarlarını iki CMS sekmesinde açın.
2. Sekme A'da değişiklik kaydedin.
3. Sekme B'deki eski formu kaydetmeye çalışın.
4. Beklenen: HTTP 409 / `CONTENT_REVISION_CONFLICT`; yeni içerik eski form tarafından overwrite edilmemeli.

---

## 6. Program görsel testi

- `/programlar`: logo/görsel beyaz alanda kırpılmadan görünmeli.
- `/programlar/engage` ve diğer detaylar: koyu hero içinde beyaz plate bulunmalı.
- Transparan PNG/WebP logolar okunur kalmalı.

---

## 7. Mobil test matrisi

Browser responsive mode veya gerçek cihaz:

- 320 px
- 360 px
- 375 px
- 390 px
- 430 px
- tablet 768 / 820 px

Kontrol edin:

- yatay sayfa scroll oluşmuyor
- program logoları kutudan taşmıyor
- haber / etkinlik / takım / galeri görselleri parent sınırını aşmıyor
- uzun başlıklar ve okul adları kart genişliğini büyütmüyor
- file/image previews CMS panelini yatay genişletmiyor

---

## 8. Content revision hakkında

Yeni tablo yoktur. Mevcut `settings` tablosunda:

```text
key = content_revision
value = ISO timestamp
```

otomatik tutulur.

Bu key kullanıcı tarafından CMS formunda düzenlenmez.
