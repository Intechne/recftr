# V3.0.2 — CMS Save + Storage Repair

- CMS content APIs now return structured JSON errors instead of silent/default 500 pages.
- Events, programs, news, documents, media, pages, settings, teams, users, payments, event registrations, team documents and document requirements have safer error handling.
- Supabase Storage config accepts `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
- Required Storage buckets are checked and created/repaired server-side when possible.
- `recf-public` bucket limit is 50 MB for Free-plan compatibility; application-level limits remain smaller where appropriate.
- File upload errors now include the actual Supabase HTTP status/message.
- Added `/admin/sistem` diagnostics panel for database schema, Storage buckets and required Vercel environment variables.
- Added idempotent `supabase/repair-v3.0.2.sql` repair migration.
- Removed stale `better-sqlite3` reference from Next.js config.
