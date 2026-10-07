BEGIN;
CREATE TABLE IF NOT EXISTS public.planning_committee_applications (
  id BIGSERIAL PRIMARY KEY,
  submission_key UUID NOT NULL UNIQUE,
  payload_fingerprint TEXT NOT NULL CHECK (payload_fingerprint ~ '^[a-f0-9]{64}$'),
  name VARCHAR(120) NOT NULL CHECK (length(trim(name))>0),
  email VARCHAR(254) NOT NULL CHECK (email=lower(email)),
  phone VARCHAR(40) NOT NULL DEFAULT '',
  city VARCHAR(80) NOT NULL,
  district VARCHAR(80) NOT NULL,
  organization VARCHAR(160) NOT NULL DEFAULT '',
  occupation VARCHAR(120) NOT NULL DEFAULT '',
  areas JSONB NOT NULL CHECK (jsonb_typeof(areas)='array' AND jsonb_array_length(areas) BETWEEN 1 AND 3),
  availability VARCHAR(100) NOT NULL,
  experience VARCHAR(2000) NOT NULL DEFAULT '',
  motivation VARCHAR(2000) NOT NULL CHECK (length(trim(motivation))>0),
  adult_confirmed BOOLEAN NOT NULL CHECK (adult_confirmed),
  kvkk_acknowledged BOOLEAN NOT NULL CHECK (kvkk_acknowledged),
  kvkk_acknowledged_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'YENİ' CHECK (status IN ('YENİ','İNCELENİYOR','İLETİŞİME GEÇİLDİ','ARŞİVLENDİ')),
  review_notes VARCHAR(2000) NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version>0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS planning_committee_status_id_idx ON public.planning_committee_applications(status,id DESC);
ALTER TABLE public.planning_committee_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.planning_committee_applications FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON SEQUENCE public.planning_committee_applications_id_seq FROM PUBLIC,anon,authenticated,service_role;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='recf_app') THEN
    RAISE EXCEPTION 'The existing recf_app server role is required';
  END IF;
  GRANT SELECT,INSERT,UPDATE ON public.planning_committee_applications TO recf_app;
  GRANT USAGE ON SEQUENCE public.planning_committee_applications_id_seq TO recf_app;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='planning_committee_applications' AND policyname='recf_app_server_all') THEN
    CREATE POLICY recf_app_server_all ON public.planning_committee_applications FOR ALL TO recf_app USING(true) WITH CHECK(true);
  END IF;
END $$;
COMMIT;
