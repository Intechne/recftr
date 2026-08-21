# RECF Türkiye V3.0.7 — Responsive / Multi-device

V3.0.6 üzerine responsive ve çoklu cihaz uyumluluk katmanı eklendi.

## Public web
- 320px telefonlardan tablet, laptop, desktop ve geniş TV ekranlarına kadar akışkan layout.
- Header/logo ve mobil navigasyon dar ekranlarda taşmayacak şekilde yenilendi.
- Mobil menü viewport yüksekliğine göre kaydırılabilir hale getirildi.
- Hero başlıkları `clamp()` ile akışkan boyutlandı; CTA butonları küçük ekranda alt alta geçer.
- Program, etkinlik, duyuru, galeri, takım ve doküman gridleri yeni breakpointlerle güncellendi.
- iPhone/iPad safe-area (notch) ve `viewport-fit=cover` desteği.
- iOS input odaklanmasında otomatik zoomu önlemek için mobil form font boyutu koruması.
- Tablet ve geniş ekranda içerik yoğunluğu dengelendi.

## CMS
- Mobil/tablet CMS için drawer menü eklendi; eski uzun yatay menü kaldırıldı.
- Header küçük ekranlarda sıkıştırıldı; yönetici bilgileri uygun breakpointte gizlenir.
- Yönetim tablolarına momentum scroll / kontrollü yatay kaydırma eklendi.
- Form kartlarının mobil padding ve touch target boyutları iyileştirildi.
- TV / ultra-wide ekranlarda CMS çalışma alanı genişletildi.

## Takım portalı
- Mobil/tablet drawer menü.
- Sticky mobil header.
- Formlar ve tablolar küçük ekranlarda taşmayacak şekilde düzenlendi.
- Touch target boyutları tablet/telefonda en az 44px olacak şekilde desteklendi.

## TV / büyük ekran
- 1536px, 1920px ve 2560px+ ekranlar için artan maksimum içerik genişlikleri.
- Klavye/TV kumandası odak göstergesi güçlendirildi.
- 2XL ekranlarda nav, footer ve ana içerik aralıkları artırıldı.

Bu sürüm veritabanı migration'ı gerektirmez.
