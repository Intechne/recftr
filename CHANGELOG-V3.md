# V3 değişiklik özeti

- Supabase-only veri katmanı; SQLite/better-sqlite3 kaldırıldı.
- CMS ve mentor girişleri ayrıldı, rol bazlı erişim eklendi.
- Program CMS'i ve public program sayfaları DB'ye bağlandı.
- Etkinlik/haber/doküman/medya CRUD ve Storage upload/delete tamamlandı.
- Public takım dizini, galeri ve dinamik sayfalar eklendi.
- Site hero/ticker/iletişim/sosyal medya ve kayıt ücretleri CMS ayarlarına taşındı.
- Başvuru onayı takım + mentor portal hesabı oluşturuyor.
- Takım yönetimi manuel takım oluşturma ve bağlı verileri temizleyerek silmeyi destekliyor.
- Belge gereksinimleri program bazlı tanımlanıyor ve portalda otomatik oluşuyor.
- Takım evrakları private bucket + signed URL ile çalışıyor.
- Etkinlik kayıtları kontenjan/program doğrulaması, onay/red/pit bilgisiyle çalışıyor.
- Ödeme kayıtları, iletişim kutusu ve audit log eklendi.
- Public ekip profilleri CMS kullanıcı yönetiminden yayınlanabiliyor.
- Demo takım/905A/Voltran ve eski V2 seed/migration dosyaları kaldırıldı.
## 3.0.1 — Vercel build fix
- `components/Chrome.tsx` public settings response is now explicitly typed.
- Fixed TypeScript errors for `ticker` and `site_name` during Next.js production builds.
- Added safer public settings fetch fallback handling.

