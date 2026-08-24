# Deploy — v3.1.6 RECF Games API Sync

1. Deploy the package normally to Vercel.
2. No RECF API key is required.
3. Optional Vercel environment variables:
   - `RECF_GAMES_API_BASE=https://games.recf.org`
   - `RECF_GAMES_REVALIDATE_SECONDS=900`
4. Run before production promotion:
   - `npm ci`
   - `npm run typecheck`
   - `npm run build`
   - `npm run security:static`
   - `npm run content:check`
   - `npm run stability:smoke`
5. Verify `/programlar/engage`:
   - badge says `RECF API CANLI` when upstream is reachable;
   - manual version matches games.recf.org;
   - scoring cards show Floor 1 / L1 5 / L2 10 / L3 25 / L4 50 / Park 25 for current Tier Takeover;
   - official scoring example totals 80 points;
   - manual, Q&A and official calculator links open correctly.
6. If the API is temporarily unavailable, the page must still render with the `DOĞRULANMIŞ YEDEK` badge.

## Architecture
Browser → RECF Türkiye Next.js page → cached server-side games.recf.org API fetch.

Do not call games.recf.org directly from every browser session; server-side caching protects both performance and the upstream anonymous rate limit.
