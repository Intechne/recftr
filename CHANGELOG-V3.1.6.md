# RECF Türkiye v3.1.6 — games.recf.org API Sync

## Added
- Server-side public RECF Manuals API integration (`lib/recf-games.ts`).
- Automatic discovery of the current Engage manual version from `/api/v1/programs`.
- Cached manual fetch from `/api/v1/programs/engage/manual/{version}`.
- Tolerant extraction of Tier Takeover scoring values and the official scoring example (rule 3.1.7).
- Official manual, Q&A and score-calculator links in the scoring UI.
- API-live / verified-fallback state badge.
- Official scoring example panel (current example: 80 points).

## Reliability
- No API key or secret is required.
- Upstream calls occur server-side only.
- Next.js/Vercel data cache revalidates every 15 minutes by default.
- If games.recf.org is unavailable or rate-limited, the current verified Tier Takeover v1.1 values are used as a safe fallback.
- Existing CMS `facts` remain available as editorial backup; they are no longer the primary scoring source for Engage.

## Environment
Optional:
- `RECF_GAMES_API_BASE=https://games.recf.org`
- `RECF_GAMES_REVALIDATE_SECONDS=900`

No database migration is required.
