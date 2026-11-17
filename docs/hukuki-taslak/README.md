# Hukuki taslaklar — AVUKAT ONAYI GEREKİR

Bu klasördeki metinler **yayında değildir** ve sitenin hiçbir sayfasından bağlantı verilmez.
Avukat onayından sonra ilgili hukuki metne (KVKK Aydınlatma Metni ve PDF'i) eklenir; sürüm numarası artırılır
(`lib/site-config.ts` → `LEGAL_VERSION`) ve `scripts/legal-docs/build.py` ile PDF'ler yeniden üretilir.

| Dosya | Konu | Durum |
|---|---|---|
| `kvkk-yurt-disina-aktarim.md` | Yurt dışına aktarım (Vercel, Supabase, e-posta altyapısı, RECF / RECFEvents.org — ABD) | Taslak · avukat onayı gerekir |
| `kvkk-saklama-sureleri.md` | Saklama ve imha süreleri | Taslak · avukat onayı gerekir |
| `en-legal-kvkk-summary.md` | /en/legal için KVKK metninin İngilizce özeti | Taslak · avukat onayı gerekir |

Köşeli parantezli alanlar (`[…]`) teyit bekleyen bilgilerdir; yayın öncesinde doldurulmalıdır.
