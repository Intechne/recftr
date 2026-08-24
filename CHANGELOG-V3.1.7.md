# RECF Türkiye v3.1.7 — All Programs RECF Games Integration

## Değişiklikler

- `games.recf.org` oyun kılavuzu entegrasyonu ortak `getProgramOfficialData()` servisine taşındı.
- RECF Engage, RECF Achieve, RECF Inspire ve Aerial Drone Competition güncel yayımlanmış manual sürümünü sunucu tarafında otomatik çözümler.
- ADC Pro da aynı resolver üzerinden kontrol edilir; RECF Manuals API'de yayınlanmadığı sürece mevcut CMS içeriği sessiz fallback olarak kullanılır.
- Engage'in detaylı Tier Takeover puanlama arayüzü korunurken API sağlık/durum rozetleri public sayfadan kaldırıldı.
- Achieve ve Inspire için Pinnacle solo + alliance puanlama kartları ve puanlama örnekleri eklendi.
- ADC için Fast Track Solo Piloting, Solo Autonomous Flight ve Teamwork/Alliance puan kartları ile goal bonus örneği eklendi.
- Public program sayfalarında `RECF API CANLI`, `API ile doğrulandı`, `API senkronu`, fallback durum metni vb. teknik sistem ifadeleri gösterilmez.
- Desteklenen programlarda hero sezon oyunu ve oyun kılavuzu bağlantısı güncel manual verisinden alınır.
- CMS teknik bilgiler alanı editoryal özet/fallback olarak korunur; veritabanı migration gerekmez.

## Public UX

Kullanıcı yalnızca yarışma içeriğini görür:
- maç türleri,
- teknik özet,
- puanlama kartları,
- puanlama örnekleri,
- oyun kılavuzu,
- Q&A,
- puan hesaplayıcı.

API'nin sağlık durumu, kaynak türü, cache/fallback bilgisi public UI'ya yansıtılmaz.
