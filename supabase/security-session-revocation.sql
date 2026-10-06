-- Apply before deploying session revocation code. Safe to run repeatedly.
CREATE TABLE IF NOT EXISTS public.security_revoked_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS security_revoked_sessions_expires_idx
  ON public.security_revoked_sessions(expires_at);
ALTER TABLE public.security_revoked_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_revoked_sessions FROM anon, authenticated;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'recf_app') THEN
    GRANT SELECT, INSERT, DELETE ON public.security_revoked_sessions TO recf_app;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='security_revoked_sessions' AND policyname='recf_app_server_all'
    ) THEN
      CREATE POLICY recf_app_server_all ON public.security_revoked_sessions
        FOR ALL TO recf_app USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;
