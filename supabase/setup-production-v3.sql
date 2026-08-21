-- RECF Türkiye V3 — Fresh production setup
-- New Supabase project: SQL Editor -> New query -> paste/run once.

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY, num TEXT NOT NULL, team TEXT NOT NULL, org TEXT NOT NULL, city TEXT NOT NULL,
  type TEXT NOT NULL, program TEXT NOT NULL, mentor TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  kit BOOLEAN NOT NULL DEFAULT FALSE, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'BAŞVURU ALINDI',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY, num TEXT NOT NULL UNIQUE, name TEXT NOT NULL, school TEXT NOT NULL, city TEXT NOT NULL,
  program TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'AKTİF';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS mentor_name TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS mentor_email TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS slogan TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY, team_num TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'ÜYE',
  cat TEXT NOT NULL DEFAULT '—', consent TEXT NOT NULL DEFAULT '—', status TEXT NOT NULL DEFAULT 'AKTİF'
);
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, tag TEXT NOT NULL DEFAULT 'DUYURU', title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', published BOOLEAN NOT NULL DEFAULT FALSE,
  date TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE news ADD COLUMN IF NOT EXISTS cover_url TEXT NOT NULL DEFAULT '';
ALTER TABLE news ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE news ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'RECF Türkiye';
ALTER TABLE news ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();


-- Editable program content
CREATE TABLE IF NOT EXISTS program_content (
 slug TEXT PRIMARY KEY, code TEXT NOT NULL, name TEXT NOT NULL, game TEXT NOT NULL DEFAULT '', age TEXT NOT NULL DEFAULT '', age_detail TEXT NOT NULL DEFAULT '', color_hex TEXT NOT NULL DEFAULT '#29B9E5', short TEXT NOT NULL DEFAULT '', long TEXT NOT NULL DEFAULT '', chips JSONB NOT NULL DEFAULT '[]'::jsonb, match_types JSONB NOT NULL DEFAULT '[]'::jsonb, facts JSONB NOT NULL DEFAULT '[]'::jsonb, source TEXT NOT NULL DEFAULT '', cover_url TEXT NOT NULL DEFAULT '', active BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO program_content(slug,code,name,game,age,age_detail,color_hex,short,long,chips,match_types,facts,source,active,sort_order) VALUES
('engage','ENG','RECF Engage','Tier Takeover','U12 & U15','15 yaşa kadar · U12 (İlkokul) ve U15 (Ortaokul) kategorileri','#29B9E5','Robotiğe ilk vida. Bean bag''ler katmanlı hedeflere taşınır; ittifak maçında iki takım ortak skor için birlikte oynar.','2026–27 sezon oyunu "Tier Takeover": 6''×8'' sahada robotlar bean bag''leri toplayıp eşleşen katmanlı hedeflere yerleştirir. Bean bag yükseldikçe puan artar; en üst katman yalnızca sarı bean bag''lere açıktır. Robotlar VEX IQ® veya LEGO® SPIKE/Mindstorms ile kurulur ve maça 11"×20"×15" boyut sınırında başlar.','["15 YAŞA KADAR · U12 & U15","2+ ÖĞRENCİ","VEX IQ® / LEGO®","ROBOT: 11\"×20\"×15\"","SAHA: 6''×8''"]'::jsonb,'[{"icon":"🎮","title":"Solo Sürüş","desc":"60 sn. Takım tek başına yarışır; 0:35–0:25 arasında kumanda ikinci sürücüye devredilir."},{"icon":"💻","title":"Solo Kodlama","desc":"60 sn. Robot yalnızca öğrencilerin yazdığı kodla, tamamen otonom görev yapar."},{"icon":"🤝","title":"İttifak Maçı","desc":"İki takım AYNI sahada birlikte oynar ve ORTAK skor için iş birliği yapar — rakip yoktur."},{"icon":"🎤","title":"Jüri Değerlendirmesi","desc":"Mühendislik defteri ve jüri mülakatı. Tasarım süreci ödüllerde puanlanır."}]'::jsonb,'[{"label":"Zemin","value":"1 puan"},{"label":"Katman 1","value":"5 puan"},{"label":"Katman 2","value":"10 puan"},{"label":"Katman 3","value":"25 puan"},{"label":"Katman 4 (sadece sarı)","value":"50 puan"},{"label":"Park","value":"25 puan"}]'::jsonb,'games.recf.org/engage/1.1',true,0),
('achieve','ACH','RECF Achieve','Pinnacle','U15 & U19','19 yaşa kadar · U15 (Ortaokul) ve U19 (Lise) kategorileri','#1E8CD9','Pin ve kupalar hedeflere istiflenir; kırmızı-mavi ittifaklar 2v2 formatta karşı karşıya gelir.','2026–27 sezon oyunu "Pinnacle": 12''×12'' sahada robotlar pin ve kupaları hedeflere istifler, ruloları çevirir. VEX V5® elektronik ile Robits®/TETRIX® MAX yapı sistemleri kullanılır. Robotlar 18"×18"×18" başlangıç boyutunda, maç içinde 24"×24" genişleme sınırında ve toplam 99W motor gücündedir. İttifak maçları 120 saniyedir ve 15 saniyelik otonom bölümle başlar.','["19 YAŞA KADAR · U15 & U19","1+ ÖĞRENCİ","VEX V5® + ROBITS®/TETRIX® MAX","120 SN · 0:15 OTONOM","SAHA: 12''×12''"]'::jsonb,'[{"icon":"🎮","title":"Solo Sürüş","desc":"60 sn. Takım sahada tek başına maksimum skoru hedefler."},{"icon":"💻","title":"Solo Kodlama","desc":"60 sn. Tamamen otonom; yalnızca öğrenci kodu."},{"icon":"⚔️","title":"İttifak Maçı 2v2","desc":"Kırmızı ittifak (2 takım) mavi ittifaka (2 takım) karşı. 0:15 otonom + 1:45 sürücü kontrolü."},{"icon":"🎤","title":"Jüri Değerlendirmesi","desc":"Mühendislik defteri ve mülakat; jüri ödüllerini belirler."}]'::jsonb,'[{"label":"Başlangıç boyutu","value":"18\"×18\"×18\""},{"label":"Genişleme","value":"24\"×24\""},{"label":"Motor gücü","value":"Toplam 99W"},{"label":"Sıralama","value":"Otonom RP + oyun sonu RP + galibiyet"},{"label":"Eleme","value":"İttifak seçimi → braket"},{"label":"Finaller","value":"En fazla 3 maç"}]'::jsonb,'games.recf.org/achieve/1.2',true,1),
('inspire','INS','RECF Inspire','Pinnacle (Üniversite)','ÜNİVERSİTE','Lise sonrası — yükseköğrenim öğrencileri','#10192F','Üniversite ligi: her takım maça İKİ robot çıkarır ve birlikte çalışan bir robot çifti tasarlar.','Inspire, Pinnacle oyununu üniversite seviyesine taşır — bir farkla: her takım maça iki robot çıkarır ve görev paylaşımı yapan bir robot çifti tasarlama fırsatına sahiptir. Açık yapı sistemi geçerlidir: sınırsız motor, özel imalat parça, 3D baskı ve işleme serbesttir. İttifak maçları 30 saniyelik otonom bölümle başlar — yazılım yatırımı ödüllendirilir.','["ÜNİVERSİTE · LİSE SONRASI","TAKIM BAŞINA 2 ROBOT","AÇIK YAPI SİSTEMİ","120 SN · 0:30 OTONOM","SAHA: 12''×12''"]'::jsonb,'[{"icon":"🎮","title":"Solo Sürüş","desc":"60 sn. İki robot aynı anda sahada — koordinasyon kendini gösterir."},{"icon":"💻","title":"Solo Kodlama","desc":"60 sn. Çift robotlu tam otonom rutinler."},{"icon":"⚔️","title":"İttifak Maçı 2v2","desc":"120 sn; 0:30 otonom + sürücü kontrolü. Her ittifakta 4 robot sahada."},{"icon":"🎤","title":"Jüri Değerlendirmesi","desc":"Mühendislik defteri, sistem tasarımı ve mülakat."}]'::jsonb,'[{"label":"Robot sayısı","value":"Takım başına 2"},{"label":"Yapı","value":"Açık sistem — sınırsız motor"},{"label":"Otonom","value":"30 saniye"},{"label":"İmalat","value":"Özel parça / 3D baskı serbest"},{"label":"Hedef kitle","value":"Mühendislik fakülteleri, teknoloji kulüpleri"},{"label":"Saha","value":"Achieve ile aynı: 12''×12''"}]'::jsonb,'games.recf.org/inspire/1.2',true,2),
('adc','ADC','Aerial Drone Competition','Mission 2027: Fast Track','ORTAOKUL / LİSE','Ortaokul ve lise öğrencileri','#8DC63F','Dört görev: Teamwork (ortak uçuş), Otonom Uçuş, Pilotaj parkuru ve jüri İletişim görüşmesi.','2026–27 sezon oyunu "Mission 2027: Fast Track". Takımlar dört görevde puan toplar: Teamwork görevinde iki takım aynı sahada birlikte uçarak ortak skoru maksimize eder; Otonom Uçuş görevinde drone yalnızca kodla uçar; Pilotaj görevinde engel parkuru hassas manuel uçuşla geçilir; İletişim görevinde jüri, takımın drone bilgisi, programlama yaklaşımı ve uçuş defterini değerlendirir. İlk yerel eleme etkinlikleri Ekim 2026''da.','["ORTAOKUL / LİSE","4 GÖREV","TEAMWORK: ORTAK SKOR","OTONOM + MANUEL UÇUŞ","İLK ETKİNLİK: EKİM 2026"]'::jsonb,'[{"icon":"🤝","title":"Teamwork Görevi","desc":"İki takım aynı sahada birlikte uçar; skor ortaktır."},{"icon":"🤖","title":"Otonom Uçuş","desc":"Drone tamamen öğrenci koduyla görev yapar."},{"icon":"🕹","title":"Pilotaj","desc":"Engel parkuru — hassas manuel uçuş, tek takım."},{"icon":"🎤","title":"İletişim","desc":"Jüri görüşmesi: drone bilgisi, kod ve uçuş defteri."}]'::jsonb,'[{"label":"Görev sayısı","value":"4"},{"label":"Teamwork","value":"Ortak skor — iş birliği"},{"label":"Sezon başlangıcı","value":"Ekim 2026 (yerel elemeler)"},{"label":"Kurallar","value":"Ağustos 2026''da yayınlandı"},{"label":"Defter","value":"Uçuş defteri jüride puanlanır"},{"label":"Süreç","value":"Yerel → bölge → dünya şampiyonası"}]'::jsonb,'recf.org/teams/competition/aerial-drone-competition',true,3),
('adc-pro','PRO','ADC Pro','Off Grid','LİSE 13+ & ÜNİ','13 yaş üstü lise öğrencileri ve üniversite','#93268F','Çoklu drone + kara aracıyla 2v2 ittifak mücadelesi. Güz ve bahar olmak üzere iki sezon.','2026–27 sezon oyunu "Off Grid": ikişer takımlı iki ittifak, bölünmüş sahada drone filosu ve kara aracıyla rakip ittifakı geçmeye çalışır. Araç seti MINDS-i yarışma drone''u, CoDrone EDU ve MINDS-i kara robotundan oluşur. Otonom Uçuş ve Pilotaj görevleri CoDrone EDU ile, Teamwork görevi tüm araçlarla oynanır. Program güz ve bahar olmak üzere iki ayrı sezon sunar; önerilen takım boyutu 3–6 kişidir.','["LİSE 13+ & ÜNİVERSİTE","3–6 KİŞİ ÖNERİLİR","DRONE + KARA ARACI","2v2 İTTİFAK","GÜZ & BAHAR SEZONU"]'::jsonb,'[{"icon":"⚔️","title":"Teamwork 2v2","desc":"İki ittifak, bölünmüş saha; drone + kara aracı birlikte görevde."},{"icon":"🤖","title":"Otonom Uçuş","desc":"CoDrone EDU ve kara aracı ile kodlu görevler."},{"icon":"🕹","title":"Pilotaj","desc":"CoDrone EDU ile engel parkuru."},{"icon":"🎤","title":"İletişim","desc":"Jüri görüşmesi + mühendislik defteri."}]'::jsonb,'[{"label":"Araçlar","value":"MINDS-i drone + kara robotu, CoDrone EDU"},{"label":"Format","value":"2v2 ittifak, bölünmüş saha"},{"label":"Sezonlar","value":"Güz (Ağu–Ara) ve Bahar (Oca–May)"},{"label":"Takım boyutu","value":"3–6 önerilir"},{"label":"Kayıt","value":"≈ $200 / takım"},{"label":"Oyun açıklanışı","value":"Şubat 2026"}]'::jsonb,'recf.org/teams/adc-pro',true,4)
ON CONFLICT(slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, code TEXT NOT NULL, title TEXT NOT NULL, city TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT '', date_label TEXT NOT NULL DEFAULT '', capacity INTEGER NOT NULL DEFAULT 64,
  registered INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'KAYIT AÇIK', excerpt TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_start TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_url TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, cat TEXT NOT NULL, size_label TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '', downloads INTEGER NOT NULL DEFAULT 0, updated_label TEXT NOT NULL DEFAULT ''
);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS team_docs (
  id SERIAL PRIMARY KEY, team_num TEXT NOT NULL, name TEXT NOT NULL, descr TEXT NOT NULL DEFAULT '',
  required BOOLEAN NOT NULL DEFAULT TRUE, status TEXT NOT NULL DEFAULT 'EKSİK', date_label TEXT NOT NULL DEFAULT ''
);
ALTER TABLE team_docs ADD COLUMN IF NOT EXISTS file_path TEXT NOT NULL DEFAULT '';
ALTER TABLE team_docs ADD COLUMN IF NOT EXISTS mime_type TEXT NOT NULL DEFAULT '';
ALTER TABLE team_docs ADD COLUMN IF NOT EXISTS review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE team_docs ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
ALTER TABLE team_docs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS document_requirements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  descr TEXT NOT NULL DEFAULT '',
  program TEXT NOT NULL DEFAULT 'ALL',
  required BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE team_docs ADD COLUMN IF NOT EXISTS requirement_id INTEGER REFERENCES document_requirements(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS team_docs_requirement_unique ON team_docs(team_num, requirement_id) WHERE requirement_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY, team_num TEXT NOT NULL, ref TEXT NOT NULL, item TEXT NOT NULL,
  date_label TEXT NOT NULL DEFAULT '', amount_label TEXT NOT NULL, status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','approvals','technical','mentor')),
  password_hash TEXT NOT NULL,
  team_num TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS public_profile BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS public_title TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS public_bio TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS public_photo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS cms_users_lower_email_idx ON cms_users(lower(email));
CREATE INDEX IF NOT EXISTS cms_users_team_idx ON cms_users(team_num);

CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_num TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'BEKLİYOR',
  pit TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, team_num)
);
CREATE INDEX IF NOT EXISTS event_reg_team_idx ON event_registrations(team_num);

CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'FOTO',
  event_slug TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  alt_text TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'YENİ', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep event.registered synchronized with active registrations.
CREATE OR REPLACE FUNCTION recf_sync_event_registered() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_id INTEGER;
BEGIN
  target_id := COALESCE(NEW.event_id, OLD.event_id);
  UPDATE events SET registered=(SELECT count(*) FROM event_registrations WHERE event_id=target_id AND status IN ('BEKLİYOR','ONAYLI')) WHERE id=target_id;
  RETURN COALESCE(NEW,OLD);
END $$;
DROP TRIGGER IF EXISTS trg_recf_sync_event_registered ON event_registrations;
CREATE TRIGGER trg_recf_sync_event_registered AFTER INSERT OR UPDATE OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION recf_sync_event_registered();

-- Storage buckets. Public media/documents live in recf-public; team files are private.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('recf-public','recf-public',true,52428800,NULL)
ON CONFLICT (id) DO UPDATE SET public=true, file_size_limit=52428800;
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('team-private','team-private',false,52428800,NULL)
ON CONFLICT (id) DO UPDATE SET public=false, file_size_limit=52428800;

-- Default editable site settings; existing values are preserved.
INSERT INTO settings(key,value) VALUES
 ('site_name','RECF Türkiye'),
 ('hero_title','MAÇ GÜNÜ HER GÜN.'),
 ('hero_description','Türkiye''nin resmi RECF robotik ve drone programları. Takımını kur, programını seç, sezon yolculuğuna başla.'),
 ('hero_image',''),
 ('ticker','["2026–27 sezon kayıtları açık"]'),
 ('contact_team','takim@recfturkiye.org'),
 ('contact_info','info@recfturkiye.org'),
 ('contact_phone',''),
 ('instagram',''),('youtube',''),('linkedin',''),('maintenance','0'),
 ('registration_fee_engage','3500'),('registration_fee_achieve','4500'),('registration_fee_inspire','5500'),('registration_fee_adc','4000'),('registration_fee_adc-pro','6000'),
 ('field_kit_fee','2800'),('registration_discount','900')
ON CONFLICT(key) DO NOTHING;


INSERT INTO pages(slug,title,body,published) VALUES
 ('hakkimizda','RECF Türkiye Hakkında','RECF Türkiye, öğrenci odaklı robotik ve drone yarışma programlarının Türkiye operasyonlarını yürütür. Bu metni CMS > Sayfalar bölümünden kurumunuzun güncel kurumsal anlatımıyla düzenleyebilirsiniz.',true),
 ('kvkk','KVKK Aydınlatma Metni','Bu alan KVKK aydınlatma metni için ayrılmıştır. Yayına almadan önce kurumunuza özel, hukuk danışmanınız tarafından onaylanmış metni CMS > Sayfalar bölümünden güncelleyin.',true),
 ('gizlilik','Gizlilik Politikası','Bu alan gizlilik politikası için ayrılmıştır. Yayına almadan önce kurumunuza özel politika metnini CMS > Sayfalar bölümünden güncelleyin.',true)
ON CONFLICT(slug) DO NOTHING;

-- Existing rows remain intact. No demo team/event/news rows are inserted by V3.

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
