-- ═══════════════════════════════════════════════════════════
-- RECF Türkiye — Migration 2 (CMS içerik tabloları)
-- Mevcut Supabase projene EK olarak çalıştır: SQL Editor → RUN
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL, title TEXT NOT NULL, city TEXT NOT NULL, venue TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 64, registered INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'KAYIT AÇIK', excerpt TEXT NOT NULL DEFAULT '', published BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, cat TEXT NOT NULL,
  size_label TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '#',
  downloads INTEGER NOT NULL DEFAULT 0, updated_label TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
  updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings ( key TEXT PRIMARY KEY, value TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS team_docs (
  id SERIAL PRIMARY KEY, team_num TEXT NOT NULL, name TEXT NOT NULL,
  descr TEXT NOT NULL DEFAULT '', required BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'EKSİK', date_label TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY, team_num TEXT NOT NULL, ref TEXT NOT NULL,
  item TEXT NOT NULL, date_label TEXT NOT NULL DEFAULT '', amount_label TEXT NOT NULL, status TEXT NOT NULL
);
ALTER TABLE events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments  ENABLE ROW LEVEL SECURITY;

-- Tohum: etkinlikler
INSERT INTO events (slug,code,title,city,venue,date_label,capacity,registered,status,excerpt) VALUES
 ('istanbul-bolge','ACH','İstanbul Bölge Turnuvası','İstanbul','Teknopark İstanbul','14 Ekim 2026',64,54,'SON KONTENJANLAR','Sezonun açılış bölge turnuvası — Pinnacle sahada.'),
 ('adc-ankara','ADC','ADC Ankara Uçuş Günü','Ankara','ODTÜ Spor Salonu','28 Ekim 2026',32,18,'KAYIT AÇIK','Fast Track görev uçuşları ve pilot brifingi.'),
 ('bursa-drone','ADC','Bursa Drone Ligi','Bursa','BTÜ Kampüsü','9 Kasım 2026',32,9,'KAYIT AÇIK','Drone futbolu lig etabı.'),
 ('izmir-lig','ENG','İzmir ENG Lig Günü','İzmir','Fuar İzmir','16 Kasım 2026',48,21,'KAYIT AÇIK','Tier Takeover lig maçları.'),
 ('ege-scrimmage','INS','Ege Scrimmage','İzmir','EÜ Spor Salonu','30 Kasım 2026',24,6,'KAYIT AÇIK','Üniversite takımları hazırlık maçları.'),
 ('kis-kupasi','ACH','Kış Kupası','İstanbul','Açıklanacak','Aralık 2026',64,0,'YAKINDA','Kapalı salon klasiği — ön kayıt 1 Ekim''de.'),
 ('turkiye-sampiyonasi','TÜMÜ','Türkiye Şampiyonası','Ankara','Açıklanacak','Nisan 2027',128,0,'YAKINDA','Sezonun finali — dünya şampiyonası kotaları.')
ON CONFLICT (slug) DO NOTHING;

-- Tohum: dokümanlar
INSERT INTO documents (name,cat,size_label,url,downloads,updated_label) VALUES
 ('ACH Pinnacle — Oyun Kılavuzu v1.2 (TR)','Oyun Kılavuzları','4.2 MB','#',1240,'14 Ağu 2026'),
 ('ENG Tier Takeover — Kural Kitabı v1.0','Oyun Kılavuzları','3.1 MB','#',890,'10 Ağu 2026'),
 ('ADC Fast Track — Görev Rehberi (TR)','Oyun Kılavuzları','2.7 MB','#',512,'08 Ağu 2026'),
 ('Robot Denetim Formu 2026-27','Formlar','180 KB','#',2100,'01 Ağu 2026'),
 ('Veli İzin Belgesi Şablonu','Formlar','120 KB','#',3400,'01 Ağu 2026'),
 ('Mühendislik Defteri Rubriği','Jüri Belgeleri','640 KB','#',760,'05 Ağu 2026'),
 ('Marka Kullanım Kılavuzu','Marka','8.9 MB','#',210,'12 Ağu 2026')
ON CONFLICT DO NOTHING;

-- Tohum: KVKK & Gizlilik (CMS'ten düzenlenebilir)
INSERT INTO pages (slug,title,body) VALUES
 ('kvkk','KVKK Aydınlatma Metni', E'RECF Türkiye (Intechne Teknoloji A.Ş.) olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; takım kayıtları, etkinlik başvuruları ve iletişim süreçlerinde paylaştığınız kişisel veriler yalnızca yarışma operasyonu, güvenlik ve yasal yükümlülükler için işlenir.\n\nİşlenen veriler: ad-soyad, e-posta, telefon, okul/kurum bilgisi ve 18 yaş altı katılımcılar için veli onay kayıtları.\n\nVerileriniz açık rızanız olmadan üçüncü taraflarla paylaşılmaz; sponsorlara aktarılmaz. Saklama süresi sezon bitimini takip eden 2 yıldır.\n\nKVKK 11. madde kapsamındaki haklarınız için kvkk@recfturkiye.org adresine başvurabilirsiniz.'),
 ('gizlilik','Gizlilik Politikası', E'Bu web sitesi, deneyiminizi iyileştirmek için yalnızca zorunlu oturum çerezleri kullanır; reklam veya izleme çerezi barındırmaz.\n\nTakım Portalı ve CMS oturumları httpOnly güvenli çerezlerle yönetilir.\n\nEtkinliklerde çekilen görseller, kayıt sırasında alınan görsel kullanım onayı kapsamında yayınlanır.\n\nSorularınız için: gizlilik@recfturkiye.org')
ON CONFLICT (slug) DO NOTHING;

-- Tohum: ayarlar
INSERT INTO settings (key,value) VALUES
 ('ticker','["2026–27 sezon kayıtları açıldı","İstanbul Bölge: son kontenjanlar","Coach Academy Eylül dönemi başvuruları sürüyor","Founding 100 programı aktif"]'),
 ('contact_team','takim@recfturkiye.org'),
 ('contact_info','info@recfturkiye.org'),
 ('maintenance','0')
ON CONFLICT (key) DO NOTHING;

-- Tohum: 905A portal verileri
INSERT INTO team_docs (team_num,name,descr,required,status,date_label) VALUES
 ('905A','Robot Denetim Formu','İstanbul Bölge öncesi zorunlu — imzalı PDF',TRUE,'ONAYLI','12 Ağu 2026'),
 ('905A','Veli İzin Belgeleri','18 yaş altı tüm üyeler için',TRUE,'İNCELEMEDE','18 Ağu 2026'),
 ('905A','Mühendislik Defteri (PDF)','Jüri ön değerlendirmesi',TRUE,'EKSİK',''),
 ('905A','Okul Resmî Yazısı','Kurum onaylı katılım yazısı',TRUE,'ONAYLI','02 Ağu 2026'),
 ('905A','Takım Logosu','Yayın grafikleri için SVG/PNG',FALSE,'EKSİK','')
ON CONFLICT DO NOTHING;

INSERT INTO payments (team_num,ref,item,date_label,amount_label,status) VALUES
 ('905A','FT-2026-0912','ACH Sezon Lisansı','28 Tem 2026','₺4.500','ÖDENDİ'),
 ('905A','FT-2026-0913','Pinnacle Saha Kiti','28 Tem 2026','₺2.800','ÖDENDİ'),
 ('905A','İND-ERKEN26','Erken Kayıt İndirimi','28 Tem 2026','−₺900','UYGULANDI'),
 ('905A','FT-2026-1044','İstanbul Bölge katılımı','16 Ağu 2026','₺750','ÖDENDİ')
ON CONFLICT DO NOTHING;
