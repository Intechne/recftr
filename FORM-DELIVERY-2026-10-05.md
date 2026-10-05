# Form kayıtları, bildirim hazırlığı ve ikonlar

## Değişiklikler

İletişim formu açık alan etiketleri, gönderim kilidi, kayıt referansı ve erişilebilir hata/başarı mesajı kullanır. Ağ veya sunucu hatasında girilen değerler korunur. Başvuru başarı ekranı bir kayıt referansı olmadan başarılı sayılmaz; henüz açık olmayan portal için otomatik e-posta vaadi kaldırılır. Yönetim başvuru ve iletişim listelerinde yükleme hatası artık boş kutu gibi gösterilmez; yeniden deneme sunulur.

Başvuru/iletişim kaydından sonra isteğe bağlı yönetici bildirimi hazırlanır. Resend adaptörü yalnızca referans ve yetkili panel bağlantısı gönderir; başvuranın adı, e-postası, telefonu ve mesajını göndermez. E-posta hatası veri kaydını başarısız göstermez. 5 saniyelik zaman aşımı ve 24 saatlik servis idempotency anahtarı vardır. Bildirim varsayılan olarak kapalıdır; Vercel preview/development ortamında gönderilmez. Gönderici/alıcı/anahtar eksikse gönderim yapılmaz. Servisin kabul cevabı gerçek alıcı teslimi olarak adlandırılmaz. E-posta başarısızsa kalıcı kuyruk/otomatik yeniden deneme yoktur; yönetim paneli esas kayıt kaynağıdır.

Manifest'teki kırık ikon bağlantıları yerel resmî marka dosyalarıyla değiştirilir. 512 px PNG ile 180 px Apple ikonu canlı CMS kaynaklarından değiştirilmeden alınmıştır. 192 px SVG, aynı resmî PNG'yi kendi içinde taşır. Kökte scope/id eklenir. CMS'de favicon/Apple ikonu tanımlı değilse yerel dosyalar kullanılır. Bu değişiklik çevrimdışı mod veya mobil cihazda kurulum testinin tamamlandığı anlamına gelmez.

## DNS ve gerekli bilgi

5 Ekim'deki salt okunur sorguda recfturkiye.com ve recfturkiye.org için MX, kök TXT/SPF ve _dmarc TXT yanıtları NOERROR/0 kayıt idi. İki alan adının NS kayıtları Vercel'e gidiyor. DKIM, sağlayıcı seçilmeden bilinmeyen seçiciler üzerinden aranmadı. Vercel production ortamında e-posta sağlayıcı anahtarı bulunmadı.

Alıcı yönetici e-postası ve kullanılacak gönderim servisi kullanıcıdan soruldu; henüz cevap yok. Bu nedenle e-posta aktive edilmedi, yeni hesap/abonelik açılmadı ve DNS yazılmadı. SMTP/başka bir servis seçilirse adaptör buna göre değiştirilir. Gönderici alan adı ve sağlayıcının ürettiği doğru SPF/DKIM kayıtları doğrulandıktan sonra Vercel production ayarları tanımlanmalı; kontrollü deneme mesajıyla teslim doğrulanmalıdır. Kutulara posta alma için MX/inbox hizmeti ayrıca gerekir.

## Testler ve sınırlar

`npm run forms:check` gerçek POST işleyicilerini izole veritabanı/auth/rate-limit sınırlarıyla çalıştırır: kayıt önce, bildirim sonra; servis/ağ hatasında 201 ve referans korunur; geçersiz/bot girişleri kaydedilmez; ücret sunucuda hesaplanır. Hazırlık, preview gönderim yasağı ve idempotency testleri vardır. Gerçek canlı veritabanına kayıt, yönetici oturumu ve e-posta teslimi bu testin kapsamında değildir. Mevcut içerik/güvenlik/regresyon kontrolleri ve Next.js derlemesi geçti; Yerel tarayıcıda HTTP 403 hata yolunda alanların korunduğu ve gönderim düğmesinin tekrar etkinleştiği doğrulandı; hiçbir canlı kayıt/e-posta oluşturulmadı. Önizleme ve canlıda 43 kontrol ve görsel doğrulama uygulanacaktır.

Supabase erişimi ve güvenlik incelemesi kullanıcı tercihiyle ertelenmiştir; bu pakette şema/RLS/Storage kayıtları değiştirilmez. Gerçek pozitif kayıt → yetkili panel doğrulaması yetkili test oturumu gerektirir.

## Resmî kaynaklar

- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://resend.com/docs/dashboard/domains/introduction
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
