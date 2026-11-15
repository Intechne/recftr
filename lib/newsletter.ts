// Onay kutusunun yanında gösterilen ve veritabanına aynen kaydedilen açık rıza metinleri.
export const NEWSLETTER_CONSENT_TEXT = "RECF Türkiye'nin etkinlik, program ve duyurularına ilişkin e-posta bülteni göndermesi için e-posta adresimin işlenmesine açık rıza veriyorum. Rızamı dilediğim zaman geri alabilirim.";
// HUKUKİ GÖZDEN GEÇİRME GEREKİR: Türkçe metnin İngilizce karşılığıdır; yayın öncesi hukuk ekibi onaylamalıdır.
export const NEWSLETTER_CONSENT_TEXT_EN = "I give my explicit consent to RECF Türkiye processing my email address in order to send me its newsletter about events, programs and announcements. I can withdraw my consent at any time.";
export const newsletterConsentText = (source: string) => (source === "footer-en" ? NEWSLETTER_CONSENT_TEXT_EN : NEWSLETTER_CONSENT_TEXT);
