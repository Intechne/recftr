# RECF Türkiye V3.0.5

> CMS + takım portalı production paketi. V3.0.5: takım kayıt formu il/ilçe seçimi, zorunlu KVKK ve CMS görsel ölçü rehberi. Sistem sağlık kontrolü: `/admin/sistem`.

# RECF Türkiye V3 — Complete CMS + Team Portal

Next.js 15 + TypeScript + Supabase PostgreSQL/Storage + Vercel için hazırlanmış production sürümü.

## Mimari

- **Public site:** programlar, etkinlikler, haber/duyurular, dokümanlar, takımlar, galeri, kurumsal sayfalar ve takım kayıt formu.
- **CMS:** `/cms-giris` → `/admin`
- **Takım portalı:** `/giris` → `/portal`
- **Database:** yalnızca Supabase PostgreSQL. SQLite fallback yoktur.
- **Storage:** `recf-public` (public medya/doküman/logo) + `team-private` (takım evrakları).
- **Oturum:** HMAC imzalı, HttpOnly cookie; CMS ve mentor girişleri ayrıdır.

## CMS modülleri

1. Programlar
2. Etkinlikler
3. Haberler & Duyurular
4. Public Dokümanlar
5. Medya Kütüphanesi
6. Sayfalar
7. Takım Başvuruları
8. Takımlar
9. Etkinlik Kayıtları
10. Belge Gereksinimleri
11. Takım Belgeleri
12. Ödemeler
13. İletişim Kutusu
14. Ekip & Yetkiler / public ekip profilleri
15. Site Ayarları / hero / ticker / iletişim / sosyal hesaplar / kayıt ücretleri
16. Audit / işlem geçmişi

## Takım portalı

- Takım dashboard
- Üye ekle / düzenle / sil
- Programına uygun etkinliğe kayıt / iptal
- Program bazlı belge gereksinimleri
- Private Storage belge yükleme / yeniden yükleme / inceleme sonucu
- Ödeme/fatura takibi
- Takım profili ve logo
- Mentor şifre değiştirme

## Roller

- `admin`: tam yetki
- `editor`: public içerik, programlar, etkinlikler, haberler, medya, sayfalar ve site ayarları
- `approvals`: başvurular, takımlar, etkinlik kayıtları, belgeler, ödemeler
- `technical`: takım belgeleri ve belge gereksinimleri
- `mentor`: yalnızca kendisine bağlı takım portalı


## V3.0.5 görsel ölçü rehberi

CMS yükleme alanlarında kullanım yerine göre önerilen ölçü doğrudan dosya alanının altında gösterilir:

| Görsel | Önerilen ölçü | Oran |
|---|---:|---:|
| Program kapağı | 1600 × 1200 px | 4:3 |
| Etkinlik kapağı | 1600 × 900 px | 16:9 |
| Haber / duyuru kapağı | 1600 × 900 px | 16:9 |
| Ana sayfa hero | 1600 × 1200 px | 4:3 |
| Galeri fotoğrafı | 1600 × 900 px | 16:9 |
| Galeri videosu | 1920 × 1080 px | 16:9 |
| Ekip profil fotoğrafı | 800 × 800 px | 1:1 |
| Takım logosu | 800 × 800 px | 1:1 |

## V3.0.5 takım kayıt formu

- İl ve ilçe ayrı, bağlı seçim alanlarıdır.
- İlçe listesi seçilen ile göre server-side veri setinden gelir.
- API il/ilçe eşleşmesini ayrıca doğrular.
- KVKK Aydınlatma Metni onayı olmadan başvuru gönderilemez; onay ve zaman damgası DB'ye kaydedilir.
- Mentor örnek adı kaldırıldı; placeholder `İsim Soyisim` olarak kullanılır.
- Takım numarası alanındaki kayan çizgi/tire yapısı kaldırıldı.

Mevcut V3 production DB için `supabase/repair-v3.0.5-registration.sql` dosyasını bir kez çalıştırın.

## Zorunlu environment variables

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
SESSION_SECRET=uzun-rastgele-deger
ADMIN_EMAIL=admin@recfturkiye.org
ADMIN_PASSWORD=cok-guclu-sifre
```

`SUPABASE_SECRET_KEY` sadece server-side kullanılmalıdır ve GitHub'a / tarayıcı koduna konulmamalıdır.

## Veritabanı kurulumu

### Mevcut V1/V2 Supabase projesi

Supabase SQL Editor'da yalnızca:

`supabase/migration-3-complete-cms.sql`

çalıştırın. Migration mevcut takım/başvuru verilerini silmez.

### Sıfırdan proje

`supabase/setup-production-v3.sql`

çalıştırın.

SQL aynı zamanda iki Storage bucket'ını oluşturur.

> KVKK ve Gizlilik sayfalarında başlangıç metni yer tutucudur. Production yayını öncesi kurumunuza özel hukuk onaylı metinleri CMS > Sayfalar bölümünden girin.

## Lokal doğrulama

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Kontrol edin:

- `/kayit` → Supabase `applications`
- `/cms-giris` → admin
- `/admin/etkinlikler` → etkinlik CRUD + görsel yükleme
- `/admin/medya` → Storage upload/delete
- `/admin/dokumanlar` → dosya upload/delete
- `/admin/belge-gereksinimleri` → portal zorunlu belge şablonları
- Başvuru onayı → `teams` + mentor hesabı
- `/giris` → mentor geçici şifresi
- `/portal/belgeler` → private upload + CMS onay
- `/portal/etkinlikler` → kayıt + CMS onay

Ayrıntılı yükseltme için `DEPLOY.md` dosyasına bakın.
