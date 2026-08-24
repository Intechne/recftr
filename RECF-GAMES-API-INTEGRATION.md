# RECF Games API Integration Plan

## Goal
Use `games.recf.org` as the source of truth for published game-manual versions, scoring data and official scoring examples while keeping RECF Türkiye fast and available if the upstream service is temporarily unavailable.

## Source endpoints
Public, read-only, no API key required:

- `GET https://games.recf.org/api/v1/programs`
  - discover programs and `currentVersionLabel`
- `GET https://games.recf.org/api/v1/programs/{slug}`
  - program metadata + published revisions
- `GET https://games.recf.org/api/v1/programs/{slug}/manual/{version}`
  - full published manual tree
- `GET https://games.recf.org/api/v1/programs/{slug}/manual/{version}/bundle`
  - manual + published Q&A + `contentHash` (recommended later if Q&A is embedded in RECF Türkiye)
- `GET https://games.recf.org/api/v1/programs/{slug}/manual/{version}/changelog`
  - revision history / update messaging
- `GET https://games.recf.org/api/v1/programs/{slug}/qa`
  - published / answered Q&A
- `GET https://games.recf.org/api/v1/programs/{slug}/qa.rss`
  - recent Q&A feed

API documentation: `https://games.recf.org/api-docs`
OpenAPI: `https://games.recf.org/api/v1/openapi.json`

## Recommended architecture

```text
Visitor browser
    |
    v
RECF Türkiye /programlar/engage
    |
    v
Next.js server (Vercel)
    |
    +--> Next Data Cache (15 min)
    |        |
    |        +--> cached normalized scoring payload
    |
    +--> games.recf.org public API
             |
             +--> current manual version
             +--> scoring section
             +--> official scoring example
```

### Important rule
Do **not** call `games.recf.org` directly from every browser. The public API is anonymously rate-limited by IP and explicitly supports caching. Keep the integration server-side.

## Implemented in v3.1.6

### `lib/recf-games.ts`
1. Reads `/api/v1/programs`.
2. Finds the current Engage manual version.
3. Reads `/api/v1/programs/engage/manual/{version}`.
4. Normalizes scoring values into:
   - floor
   - l1
   - l2
   - l3
   - l4
   - park
5. Detects official scoring example rule `3.1.7`.
6. Returns links to:
   - manual
   - Q&A
   - official score calculator
7. Caches upstream calls via Next `fetch(..., { next: { revalidate } })`.
8. Falls back to the last verified Tier Takeover values if the upstream service fails.

### `components/public/EngageScoringSection.tsx`
The UI now receives the normalized server payload and shows:
- API-live / fallback status;
- current manual version;
- scoring cards;
- color matching rules;
- official manual scoring example;
- interactive educational score calculator;
- official RECF score-calculator link;
- Q&A and manual links.

## Current Tier Takeover verified values
- Floor Goal: 1
- L1: 5
- L2: 10
- L3: 25
- L4: 50 (yellow only)
- Parked Robot: 25

Official rule 3.1.7 example:
- 2 red bags in L1 = 10
- 2 red bags in L2 = 20
- 1 red + 1 yellow in L3 = 50
- total = 80
- blue bags in the red goal do not score

## Cache policy
Default: 900 seconds (15 minutes).

Environment override:

```env
RECF_GAMES_API_BASE=https://games.recf.org
RECF_GAMES_REVALIDATE_SECONDS=900
```

A 15-minute interval is a good production default because manual revisions are infrequent but official Q&A answers may be time-sensitive. If Q&A is later displayed directly on RECF Türkiye, use a shorter independent cache (for example 5 minutes) for Q&A endpoints.

## Fallback policy
If the upstream API times out, returns 429, 5xx or invalid JSON:
- never break the program page;
- show `DOĞRULANMIŞ YEDEK` status;
- use the current verified local scoring snapshot;
- keep official links available;
- retry on the next cache revalidation window.

Do not silently replace the page with zero values.

## CMS policy
For Engage, the API is the primary scoring source.

CMS `facts` remains useful for:
- emergency fallback;
- Turkish editorial descriptions;
- information not represented in the API;
- temporary content before a new game manual is published.

Do not make staff manually copy every new RECF scoring revision into CMS.

## Version-change workflow
When RECF publishes a new manual version:
1. `/api/v1/programs` returns a new `currentVersionLabel`.
2. RECF Türkiye fetches that version after cache expiry.
3. scoring extraction runs against the new manual.
4. version badge changes automatically.
5. page content uses new values if the scoring table changed.
6. if extraction cannot confidently understand a new game structure, fallback remains visible rather than presenting unverified numbers.

For a **new season / new game**, review the normalizer because game-specific scoring concepts can change radically.

## Phase 2 — Achieve and Inspire
Both programs are published on games.recf.org and should use the same server adapter pattern, but Pinnacle has a different scoring model. Create program-specific normalizers rather than forcing every game into the Engage model.

Recommended structure:

```text
lib/recf-games/
  client.ts
  types.ts
  programs.ts
  normalize-engage.ts
  normalize-achieve.ts
  normalize-inspire.ts
  normalize-aerial-drone.ts
```

A shared client handles version discovery, caching and errors; each normalizer understands its own scoring rules.

## Phase 3 — Q&A integration
Add a small `Güncel Resmî Q&A` module under technical details:
- fetch only `status=answered`;
- show 3 latest relevant answers;
- display targeted rule number and answer date;
- link to the full official Q&A entry;
- do not copy submitter profile information unless it is genuinely needed.

For rule-level context, use:
`GET /api/v1/programs/{slug}/rules/{stableKey}/qa`

## Phase 4 — Update monitoring
Optional production automation:
- check `/api/v1/programs` hourly;
- compare current version labels to the version last observed by RECF Türkiye;
- notify the content/technical team when a manual revision changes;
- run an automated scoring-normalizer validation before publishing a new normalized representation.

## Deployment checklist
- [ ] Deploy v3.1.6.
- [ ] Optional env variables added in Vercel.
- [ ] `/programlar/engage` renders when games.recf.org is reachable.
- [ ] Manual version matches the official source.
- [ ] Current scores are 1 / 5 / 10 / 25 / 50 / 25.
- [ ] Official example totals 80.
- [ ] Official Score Calculator opens.
- [ ] Q&A link opens.
- [ ] Simulate API failure and verify fallback UI.
- [ ] Run `npm run typecheck` and `npm run build` on a networked machine / Vercel preview.
