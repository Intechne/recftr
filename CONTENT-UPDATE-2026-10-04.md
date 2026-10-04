# Kamuya açık içerik ve kayıt akışı düzeltmeleri

Bu güncelleme, 4 Ekim incelemesindeki doküman, program, etkinlik ve kayıt akışı sorunlarını ele alır. Veritabanı kayıtlarını veya dosyaları silmez; kullanıcı verisi ya da Supabase yapılandırması değiştirmez.

- Altı `#` doküman bağlantısında indirme butonu yerine yayımlanmamış dosya durumu gösterilir. Yanlış ARDL dosyasının bilinen Storage yolu üzerinden indirme engellenir. Dosya değiştirilince bu koruma yeni doğru URL’ye uygulanmaz. Beş programın İngilizce resmî kaynakları ayrıca sunulur. Gerçek Türkçe belgeler hâlâ hazırlanmalı/yüklenmeli.
- ADC Pro resmî kodu `pro` olarak eşlenir. v0.9 örnekleri, waypoint/alan tarama/çarpan tablosu kaldırılır. v2.0 §3.1/4.2/5.1 ile doğrulanan sınırlı puan özeti ve kaynak kontrol tarihi gösterilir. Daha yeni bir sürüm geldiğinde v2.0 puanları o sürümün puanlarıymış gibi gösterilmez.
- Achieve’in 0:30/30 saniye otonom bilgisi 0:15/15 saniye olarak düzeltilir; v2.0 ittifak neutral goal halfpin değeri 7 puan olarak ayrı gösterilir. Inspire’ın otonom süresi değiştirilmez.
- Geçmiş etkinlikler yaklaşan listelerden çıkarılır, arşiv filtresinde tutulur. Süresi bitmiş etkinliğe sunucuda yeni kayıt reddedilir. Henüz açık olmayan portal üzerinden kayıt olma iddiası kaldırılır; takım ön başvurusu ile etkinlik kaydı ayrılır.
- Ulusal şampiyonanın bilinen kaydındaki Mart/Nisan çelişkisi sürerken tarih kesinmiş gibi sunulmaz; yayımlanan tarih etiketi veya kaynak kayıt düzeltildiğinde geçici koruma kalkar. Kurumun doğru tarihi ayrıca teyit etmesi gerekir.
- Program sayfasından `/kayit?program=...` ile seçim taşınır. Geçersiz/tekrarlı parametreler güvenli varsayılana döner. Form alanları görünür etiketlerine bağlanır, hata mesajı erişilebilir uyarı olur.
- Ön başvuru ve resmî numara/lisans ayrımı form ve rehberde açıklanır. Doğrulanmamış 24 saat e-posta ve güvenli ödeme bağlantısı vaatleri kaldırılır. Ücret özeti adımı formda ödeme alınmadığını açıklar.
- Kamu sayfalarındaki CMS uygulama açıklamaları ziyaretçiye yönelik metinlerle değiştirilir. Robots dosyası Next.js statik kaynaklarını engellemez. Etkinlik JSON-LD doğru tarih sütunlarını kullanır; teyitsiz ücretsiz bilet/Offer bilgisi kaldırılır.

## Doğrulama

`npm run content:regression` bozuk/yanlış belge, tarih sınırları (Türkiye saat dilimi), Date ve JSON tarihleri, çelişen/düzeltilmiş takvim, beş programın seçimi, Achieve/Inspire ayrımı, resmî kaynak kesintisi ve yeni kılavuz sürümü durumlarını doğrular. Mevcut `content:check` ve `security:static` kontrolleri, tip kontrolü ve Next.js derlemesi uygulanır. Canlıya geçmeden Vercel test yayını gerçek kamu içeriğiyle ayrıca kontrol edilmelidir.

## Kaynaklar ve kalan işler

- https://games.recf.org/pro/2.0 (§3.1, §4.2, §5.1)
- https://games.recf.org/achieve/2.0 (§5.3.1, §5.1.3)
- https://games.recf.org/api-docs

Supabase erişimi kullanıcının tercihiyle sonraki aşamaya bırakıldı. CMS’deki asıl kayıtların kalıcı düzeltmesi, RLS/MFA/Storage kontrolü, doğru Türkçe dosyalar, kesin etkinlik tarihleri, güncel akademi duyuruları, e-posta DNS ayarları ve hukuki içerik incelemesi ayrı işlerdir.
