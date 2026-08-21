# RECF Türkiye — Broadcast Konsept · Tam Sistem

Web sitesi + Takım Portalı + CMS + canlı backend (SQLite). Next.js 14 · TypeScript · Tailwind.

## Çalıştırma
```bash
npm install
npm run dev     # http://localhost:3000
```

## Demo Hesaplar (/giris)
| Rol | E-posta | Şifre | Erişim |
|---|---|---|---|
| Yönetici | admin@recfturkiye.org | recf2026 | /admin (CMS) + /portal |
| Mentor | mentor@voltran.org | 905a | /portal (Takım 905A) |

## Canlı Akışlar
- **/kayit** → başvuru SQLite'a yazılır → **/admin/onaylar**'da ONAYLA → takım anında **/takimlar**'da "YENİ KAYIT" rozetiyle görünür.
- **/admin/haberler** → YAYINLA → haber **/duyurular**'da "CANLI" etiketiyle listelenir; detay sayfası DB'den render edilir.
- **/portal/uyeler** → davet et → üye listesi DB'de güncellenir.
- Oturum: `POST /api/auth` httpOnly cookie · `middleware.ts` /admin'i admin'e, /portal'ı mentor+admin'e kilitler.

## Mimari
- `lib/db.ts` — repository katmanı (better-sqlite3, WAL). Supabase/Postgres'e geçiş: yalnızca bu dosyadaki fonksiyon gövdeleri değişir.
- `app/api/*` — applications, applications/[id], teams, members, news, auth rotaları.
- Veri: `recf.db` otomatik oluşturulur ve örnek başvuru/üyelerle tohumlanır (`RECF_DB_PATH` ile taşınabilir).
- Not: Vercel gibi sunucusuz ortamlarda dosya tabanlı SQLite kalıcı değildir — üretimde Supabase önerilir.

## Sayfa Haritası
**Site:** / · /programlar(+5) · /etkinlikler(+7, sekmeli detay) · /duyurular(+detay, DB fallback) · /dokumanlar · /takimlar · /kayit (4 adım, canlı plaka) · /rehber/takim-kaydi · /rehber/mentor · /hakkimizda · /giris · 404
**Portal:** panel · üyeler (canlı) · etkinlik kayıtları · belgeler · ödemeler · takım ayarları
**CMS:** genel bakış · etkinlikler · haberler (canlı yayın) · onaylar (canlı) · dokümanlar · medya · ekip & yetkiler · site ayarları

Zorunlu ibare: "RECF ve VEX Robotics ayrı kuruluşlardır" (footer).


## 🚀 Yayına Alma — Supabase + Vercel (≈10 dk)

### 1) Supabase veritabanı
1. [supabase.com](https://supabase.com) → **New project** (bölge: `eu-central-1` Frankfurt önerilir).
2. Sol menü **SQL Editor** → `supabase/schema.sql` dosyasının içeriğini yapıştır → **Run**. (Tablolar + örnek veriler kurulur.)
3. **Project Settings → Database → Connection string → URI** sekmesinden **Transaction pooler** (port **6543**) adresini kopyala:
   `postgresql://postgres.xxxx:[ŞİFRE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`

### 2) Kodu GitHub'a it
```bash
git init && git add -A && git commit -m "RECF Türkiye v1"
git remote add origin https://github.com/KULLANICI/recf-turkiye.git
git push -u origin main
```

### 3) Vercel
1. [vercel.com](https://vercel.com) → **Add New → Project** → GitHub deposunu seç (framework otomatik: Next.js).
2. **Environment Variables** bölümüne ekle:
   | Ad | Değer |
   |---|---|
   | `DATABASE_URL` | 1. adımdaki pooler URI'si |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | gerçek yönetici bilgileri |
   | `MENTOR_EMAIL` / `MENTOR_PASSWORD` | demo takım hesabı |
3. **Deploy** → `https://recf-turkiye.vercel.app` canlı.
4. Özel alan adı: Project → **Domains** → `recfturkiye.org` ekle → DNS'te gösterilen A/CNAME kayıtlarını gir.

### Doğrulama listesi (canlıda)
- [ ] `/kayit` → başvuru gönder → Supabase **Table Editor → applications**'da satır göründü mü?
- [ ] `/giris` (admin) → `/admin/onaylar` → ONAYLA → `/takimlar`'da "YENİ KAYIT" ✓
- [ ] `/admin/haberler` → YAYINLA → `/duyurular/...` DB'den render ✓
- [ ] Yanlış şifre → 401; mentor ile `/admin` → /giris'e yönlenme ✓

### Notlar
- `DATABASE_URL` **boşken** uygulama otomatik SQLite'a döner (yalnız yerel geliştirme için; Vercel'de kalıcı değildir).
- Bağlantı **Transaction pooler (6543)** olmalı — `prepare:false` bu mod için ayarlı. Doğrudan 5432 kullanacaksan sorun olmaz, ancak sunucusuz ortamda pooler önerilir.
- Bir sonraki güvenlik adımı: cookie-rol oturumunu **Supabase Auth**'a taşımak ve RLS politikalarını role göre açmak (repository katmanı sayesinde `lib/db.ts` dışında değişiklik gerekmez).
