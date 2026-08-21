# RECF Türkiye — Supabase + Vercel Production Deploy

This hardened copy targets Next.js 15.5.21 (Maintenance LTS), React 19.2.x and Node.js 24.x.

## 1. Supabase
1. Create a Supabase project in a region close to users.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Do NOT run `supabase/seed.demo.sql` on production.
4. Dashboard → Connect → copy Transaction pooler URI (port 6543).

## 2. Local environment
Copy `.env.example` to `.env.local` and set:
- DATABASE_URL (or POSTGRES_URL from the Vercel Supabase integration)
- SESSION_SECRET (`openssl rand -base64 48`)
- ADMIN_EMAIL / ADMIN_PASSWORD
- MENTOR_EMAIL / MENTOR_PASSWORD

Then run:
```bash
npm install
npm run dev
```

## 3. GitHub
```bash
git init
git add -A
git commit -m "RECF Türkiye production deploy"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 4. Vercel
1. Import the GitHub repository.
2. Framework Preset: Next.js.
3. Node.js Version: 24.x (also pinned in package.json).
4. Add Production/Preview environment variables:
   - DATABASE_URL (or POSTGRES_URL from the Vercel Supabase integration)
   - SESSION_SECRET
   - ADMIN_EMAIL
   - ADMIN_PASSWORD
   - MENTOR_EMAIL (optional for current single-team demo portal)
   - MENTOR_PASSWORD (optional)
5. Deploy.

## 5. Smoke test
- `/` loads.
- `/kayit` creates a row in Supabase `applications`.
- Admin login opens `/admin`.
- `/admin/onaylar` approval creates a row in `teams`.
- `/takimlar` shows the approved team.
- `/admin/haberler` publishes a record into `news` and `/duyurular` displays it.
- Mentor can access `/portal` but cannot access `/admin`.

## 6. Custom domain
Vercel Project → Settings → Domains → add your domain and apply the DNS records Vercel shows.

## Current portal limitation
The current mentor portal is still a single-team prototype: `app/api/members/route.ts` uses `TEAM = "905A"`. Do not onboard multiple real mentor accounts with this model. For multi-team production, migrate mentor login/team ownership to Supabase Auth + profiles/team_members before public rollout of the portal.
