-- OPTIONAL BUT STRONGLY RECOMMENDED: dedicated application DB role.
-- 1) Run this SQL as postgres in Supabase SQL Editor.
-- 2) Then separately set a long random password:
--      ALTER ROLE recf_app WITH PASSWORD 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD';
-- 3) Replace DATABASE_URL in Vercel with the connection string using recf_app.
-- Never commit the password to Git.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='recf_app') THEN
    CREATE ROLE recf_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END $$;

GRANT CONNECT ON DATABASE postgres TO recf_app;
GRANT USAGE ON SCHEMA public TO recf_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  applications, teams, members, news, program_content, events, documents, pages, settings,
  team_docs, document_requirements, payments, cms_users, event_registrations, media, contacts,
  audit_logs, security_rate_limits
TO recf_app;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO recf_app;

-- Explicitly do NOT grant CREATE on schema/database and do NOT grant role-management privileges.

-- The schema has RLS enabled. Allow the dedicated server-side role to operate on the
-- explicitly granted application tables while anon/authenticated remain blocked.
DO $$
DECLARE t text; policy_name text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'applications','teams','members','news','program_content','events','documents','pages','settings',
    'team_docs','document_requirements','payments','cms_users','event_registrations','media','contacts',
    'audit_logs','security_rate_limits'
  ] LOOP
    policy_name := 'recf_app_server_all';
    IF to_regclass('public.' || t) IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=policy_name
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO recf_app USING (true) WITH CHECK (true)', policy_name, t);
    END IF;
  END LOOP;
END $$;
