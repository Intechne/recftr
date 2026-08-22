-- RECF Türkiye V3.1.0 Security Hardening — mandatory migration
-- Safe to run repeatedly.

ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS mfa_secret TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS security_rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (key, window_start)
);
CREATE INDEX IF NOT EXISTS security_rate_limits_expires_idx ON security_rate_limits(expires_at);
ALTER TABLE security_rate_limits ENABLE ROW LEVEL SECURITY;

-- This application does not use Supabase browser/PostgREST access for these tables.
-- Keep anon/authenticated roles from reading operational data directly if an anon key is ever exposed.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'applications','teams','members','news','program_content','events','documents','pages','settings',
    'team_docs','document_requirements','payments','cms_users','event_registrations','media','contacts','audit_logs','security_rate_limits'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    END IF;
  END LOOP;
END $$;

-- Ensure old users receive valid session-version state. Existing sessions from V3.0.9
-- intentionally stop working after deployment because old tokens have no session_version claim.
UPDATE cms_users SET session_version=1 WHERE session_version IS NULL OR session_version < 1;
