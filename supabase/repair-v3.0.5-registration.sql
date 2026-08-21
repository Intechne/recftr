-- RECF Türkiye V3.0.5 — Registration form location + KVKK repair
-- Existing production database: run once in Supabase SQL Editor.
-- Idempotent; existing rows are preserved.

ALTER TABLE applications ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS kvkk_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS kvkk_accepted_at TIMESTAMPTZ;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';

-- Existing historical applications are intentionally left with kvkk_accepted=false.
-- New applications are accepted only when the API receives explicit KVKK consent.
