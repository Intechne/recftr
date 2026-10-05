// CMS'te (pages tablosu) kayıt yoksa kullanılan hukuki metinler. CMS → Sayfalar'dan aynı slug ile düzenlenebilir.
export const LEGAL_FALLBACK: Record<string, { title: string; body: string }> = {
  "kvkk": { title: "KVKK Aydınlatma Metni", body:
`RECF Türkiye (Intechne Teknoloji A.Ş.) olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; takım kayıtları, etkinlik başvuruları ve iletişim süreçlerinde paylaştığınız kişisel veriler yalnızca yarışma operasyonu, güvenlik ve yasal yükümlülükler için işlenir.

İşlenen veriler: ad-soyad, e-posta, telefon, okul/kurum bilgisi ve 18 yaş altı katılımcılar için veli onay kayıtları. Hukuki dayanak: KVKK m.5/2-c (sözleşmenin kurulması), m.5/2-ç (hukuki yükümlülük) ve gerektiğinde açık rıza.

Verileriniz açık rızanız olmadan üçüncü taraflarla paylaşılmaz; sponsorlara aktarılmaz. Barındırma altyapısı (Vercel, Supabase) veri işleyen sıfatıyla yalnızca teknik saklama hizmeti verir. Saklama süresi sezon bitimini takip eden 2 yıldır.

KVKK 11. madde kapsamındaki haklarınız (bilgi talebi, düzeltme, silme, itiraz) için destek@recfturkiye.com adresine başvurabilirsiniz; başvurular 30 gün içinde yanıtlanır.` },
  "gizlilik": { title: "Gizlilik Politikası", body:
`Bu web sitesi yalnızca zorunlu oturum çerezleri kullanır; reklam veya izleme çerezi barındırmaz. Ziyaretçi analitiği yapılıyorsa yalnızca anonimleştirilmiş, çerezsiz sayım biçiminde olur.

Takım Portalı ve CMS oturumları httpOnly, Secure çerezlerle yönetilir; şifreler düz metin saklanmaz. Kayıt formundaki bilgiler yalnızca RECF Türkiye ekibinin erişebildiği yönetim panelinde tutulur.

Etkinliklerde çekilen fotoğraf ve videolar, kayıt sırasında alınan görsel kullanım onamı kapsamında yayınlanır; onam vermeyen katılımcılar yayın akışında bulanıklaştırılır. Yapay zekâ ile üretilen görseller gerçek etkinlik fotoğrafı gibi sunulmaz.

Bu politika KVKK Aydınlatma Metni, Çerez Politikası ve Kullanım Koşulları ile birlikte geçerlidir. Sorularınız için: destek@recfturkiye.com` },
  "kullanim-kosullari": { title: "Kullanım Koşulları", body:
`Bu web sitesi (recfturkiye.com ve recfturkiye.org) Intechne Teknoloji A.Ş. tarafından, Robotics Education & Competition Foundation (RECF) programlarının Türkiye operasyonu kapsamında işletilmektedir. Siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.

1. Hizmetin Kapsamı — Site; program bilgileri, etkinlik takvimi, dokümanlar, takım/mentor ön kayıt formu ve duyuruları sunar. Takım Yönetim Platformu ayrı kullanım şartlarına tabi olup yayına alındığında duyurulacaktır.

2. Kayıt ve Doğruluk — Kayıt formunda verilen bilgilerin doğru ve güncel olması kullanıcının sorumluluğundadır. 18 yaş altı katılımcılar için mentor/veli onayı zorunludur. RECF Türkiye, eksik veya yanıltıcı başvuruları reddetme hakkını saklı tutar.

3. Fikri Mülkiyet — Sitedeki metin, tasarım, illüstrasyon, rozet ve logolar Intechne Teknoloji A.Ş.'ye; RECF program adları ve oyun kılavuzları RECF'e aittir. Oyun kuralları için bağlayıcı kaynak games.recf.org üzerindeki İngilizce kılavuzdur; Türkçe çeviriler yardımcı niteliktedir. RECF ve VEX Robotics ayrı kuruluşlardır.

4. Kabul Edilebilir Kullanım — Siteye zarar verecek, yetkisiz erişim sağlayacak veya diğer kullanıcıların haklarını ihlal edecek eylemler yasaktır.

5. Sorumluluk Sınırı — Etkinlik tarih, mekan ve kontenjanları değişebilir; güncel bilgi etkinlik sayfasında yayınlanır. Site "olduğu gibi" sunulur; kesintisiz erişim garanti edilmez.

6. Değişiklikler — Koşullar önceden bildirilmeksizin güncellenebilir; güncel sürüm bu sayfada yayınlanır.

7. Uygulanacak Hukuk — Türkiye Cumhuriyeti hukuku uygulanır; uyuşmazlıklarda İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir.

İletişim: destek@recfturkiye.com` },
  "cerez-politikasi": { title: "Çerez Politikası", body:
`Bu politika, recfturkiye.com ve recfturkiye.org adreslerinde çerezlerin nasıl kullanıldığını açıklar.

Kullandığımız çerezler yalnızca ZORUNLU çerezlerdir:
• recf_session — Yönetim paneli ve (yayına alındığında) Takım Portalı oturumunu güvenli şekilde sürdürmek için kullanılır. httpOnly ve Secure bayraklıdır; 8 saat sonra kendiliğinden silinir. Ziyaretçiler için oluşturulmaz.
• recf_cookie_consent_v1 — Çerez bildirimini gördüğünüzü cihazınızda (localStorage) saklar; sunucuya gönderilmez.

Kullanmadığımız çerezler: reklam, davranışsal izleme, üçüncü taraf analitik profilleme çerezleri kullanılmaz. Google Fonts gibi dış kaynaklar yalnızca yazı tipi sunar ve çerez yazmaz.

Çerezleri yönetme: Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezler engellenirse yönetim paneline giriş yapılamaz; kamuya açık sayfalar etkilenmez.

Bu politika KVKK Aydınlatma Metni ve Gizlilik Politikası ile birlikte okunmalıdır. Sorular: destek@recfturkiye.com` },
};
