-- RECF Türkiye — site eksikleri (feat/site-eksikleri)
-- Yalnız ekleme yapar: hiçbir tablo, kolon veya satır silinmez; mevcut veriler değişmez.
-- Uygulama sırası: önce bu migration, sonra kod deploy'u. Kod, migration uygulanmadan önce
-- de public sayfaları boş/gizli durumlara düşürerek açık tutar.
BEGIN;

-- 1) Etkinlik veri modeli: harici kayıt linki ve "tarih teyit bekleniyor" durumu.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date_tbc BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Founding 100 listesi: takımın adı/okulu/ili yalnız açık onam + yayın onayıyla görünür.
--    Mevcut takımlar varsayılan olarak listede görünmez (onam kaydı yok).
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS public_listing_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS public_listing_consent_at TIMESTAMPTZ;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS public_listing_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS public_listing_consent_at TIMESTAMPTZ;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS public_listing_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- 3) Randevu / iş birliği / lansman katılım talepleri (okullar, rehber, is-birlikleri, lansman formları).
CREATE TABLE IF NOT EXISTS public.lead_requests (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('okul_randevu','destek_randevu','isbirligi','lansman_katilim')),
  submission_key UUID NOT NULL UNIQUE,
  payload_fingerprint TEXT NOT NULL CHECK (payload_fingerprint ~ '^[a-f0-9]{64}$'),
  name VARCHAR(120) NOT NULL CHECK (length(trim(name))>0),
  email VARCHAR(254) NOT NULL CHECK (email=lower(email)),
  phone VARCHAR(40) NOT NULL DEFAULT '',
  organization VARCHAR(160) NOT NULL DEFAULT '',
  role VARCHAR(120) NOT NULL DEFAULT '',
  city VARCHAR(80) NOT NULL DEFAULT '',
  message VARCHAR(3000) NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details)='object'),
  kvkk_acknowledged BOOLEAN NOT NULL CHECK (kvkk_acknowledged),
  kvkk_acknowledged_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'YENİ' CHECK (status IN ('YENİ','İNCELENİYOR','İLETİŞİME GEÇİLDİ','TAMAMLANDI','ARŞİVLENDİ')),
  review_notes VARCHAR(2000) NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version>0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_requests_kind_status_id_idx ON public.lead_requests(kind,status,id DESC);

-- 4) E-posta bülteni: açık rıza metni ve zamanı ile birlikte saklanır.
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE CHECK (email=lower(email)),
  consent_given BOOLEAN NOT NULL CHECK (consent_given),
  consent_text VARCHAR(600) NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source VARCHAR(80) NOT NULL DEFAULT 'footer',
  status TEXT NOT NULL DEFAULT 'AKTİF' CHECK (status IN ('AKTİF','AYRILDI')),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) İş birliği / partner logoları: yalnız CMS'ten eklenen ve yayınlanan kayıtlar görünür.
CREATE TABLE IF NOT EXISTS public.partners (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL CHECK (length(trim(name))>0),
  logo_url TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  tier VARCHAR(60) NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Yeni tablolar yalnız sunucu rolüne açık (mevcut planning_committee_applications deseni).
ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lead_requests, public.newsletter_subscriptions, public.partners FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE public.lead_requests_id_seq, public.newsletter_subscriptions_id_seq, public.partners_id_seq FROM PUBLIC, anon, authenticated, service_role;
DO $$
DECLARE t TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='recf_app') THEN
    RAISE EXCEPTION 'The existing recf_app server role is required';
  END IF;
  GRANT SELECT,INSERT,UPDATE ON public.lead_requests, public.newsletter_subscriptions TO recf_app;
  GRANT SELECT,INSERT,UPDATE,DELETE ON public.partners TO recf_app;
  GRANT USAGE ON SEQUENCE public.lead_requests_id_seq, public.newsletter_subscriptions_id_seq, public.partners_id_seq TO recf_app;
  FOREACH t IN ARRAY ARRAY['lead_requests','newsletter_subscriptions','partners'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='recf_app_server_all') THEN
      EXECUTE format('CREATE POLICY recf_app_server_all ON public.%I FOR ALL TO recf_app USING (true) WITH CHECK (true)', t);
    END IF;
  END LOOP;
END $$;

-- 6) Taslak etkinlik kayıtları (yayında DEĞİL). Tarih/mekân teyit edilince CMS'ten girilip yayınlanır.
INSERT INTO public.events (slug,code,title,city,venue,date_label,status,excerpt,body,published,featured,registration_enabled,date_tbc)
VALUES
  ('recf-turkiye-lansman-etkinligi','TÜMÜ','RECF Türkiye Lansman Etkinliği','','','', 'YAKINDA',
   'Okullar, antrenörler ve veliler için RECF Türkiye programlarının tanıtıldığı lansman buluşması.','',FALSE,FALSE,FALSE,TRUE),
  ('adc-turkiye-turnuvasi','ADC','Aerial Drone Competition Türkiye Turnuvası','','','', 'YAKINDA',
   'Aerial Drone Competition takımlarının Türkiye''de sahaya çıktığı turnuva.','',FALSE,FALSE,FALSE,TRUE)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
