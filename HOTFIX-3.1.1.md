# V3.1.1 Build Fix

V3.1.0 Security Hardening paketinin Vercel TypeScript kontrol aşamasında görülen iki build hatası giderildi.

- `verifyStoredObject()` dönüş tipi discriminated union olarak tanımlandı; başarılı doğrulama sonrasında `size` ve `mime` artık TypeScript tarafından kesin olarak biliniyor.
- `dbDiagnostics()` hata dönüşündeki boş `missingTables` dizisi `string[]` olarak açıkça tiplenerek `includes("security_rate_limits")` için oluşan `never` çıkarımı giderildi.
- Uygulama sürümü `3.1.1` olarak güncellendi.

Güvenlik davranışlarında geriye dönüş yoktur; V3.1.0 hardening değişikliklerinin tamamı korunur.
