# Kullanıcı tarafından verilen hukuki belgelerin entegrasyonu

Üç PDF değişmeden public/legal klasörüne kopyalanır. Web görünümü PDF'den çıkarılan metni kullanır; yalnız boşluklar ve satırların sunumu düzenlenir. Hukuki ifadeler, şirket bilgileri, açık rıza konuları, imza ve doldurulacak alanlar değiştirilmez. SHA-256 değerleri lib/provided-legal-documents.json içinde tutulur. PDF'lerin beş sayfası görsel olarak incelendi.

/kvkk artık kullanıcının verdiği KVKK PDF'sindeki metni gösterir; eski CMS metni veritabanından silinmez. /acik-riza, /katilim-onami ve /hukuki-belgeler eklenir. Belgeler footer, doküman sayfası, kayıt formu ve iletişim formundan bulunabilir; yeni sayfalar sitemap'e eklenir.

Kayıt formunun mevcut kvkk alanı, aydınlatma metninin okunduğu bildirimi olarak gösterilir. Açık rızanın dört ayrı tercihi ve veli/öğrenci katılım imzası bu tek alana birleştirilmez. Elektronik rıza/e-imza sistemi uygulanmadı; bu alanlar orijinal PDF formunda ayrı doldurulmalıdır. Yeni kişisel kimlik/sağlık/imza verileri çevrimiçi toplanmaz, schema/Storage/RLS değişmez.

Tebliğ ve Kurumun 2026/347 duyurusu aydınlatma ile açık rızanın ayrılmasını doğrular. Bu entegrasyon belgelerin hukuki uygunluğuna ilişkin bağımsız bir onay anlamına gelmez. PDF'lerde telefon, tarih, etkinlik ve imza alanları kaynaktaki gibi boştur.

Kaynak: https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig
2026 duyurusu: https://www.kvkk.gov.tr/Icerik/8710/veri-sorumlulari-tarafindan-acik-riza-ve-aydinlatma-metinlerinin-ayri-ayri-duzenlenmesi-gerektigi-hakkinda-kisisel-verileri-koruma-kurulunun-18-02-2026-tarihli-ve-2026-347-sayili-ilke-kararina-iliskin-kamuoyu-duyurusu
