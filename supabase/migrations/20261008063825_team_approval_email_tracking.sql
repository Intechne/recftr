-- Additive tracking on the existing private applications table. No new grants.
ALTER TABLE public.applications
  ADD COLUMN approval_email_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_email_status IN ('pending','sending','accepted','failed','disabled')),
  ADD COLUMN approval_email_attempted_at timestamptz,
  ADD COLUMN approval_email_sent_at timestamptz,
  ADD COLUMN approval_email_provider_id text,
  ADD COLUMN approval_email_claim uuid;
