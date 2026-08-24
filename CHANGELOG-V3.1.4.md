# Changelog V3.1.4

## Fixed
- Vercel `FUNCTION_INVOCATION_TIMEOUT` / HTTP 504 after V3.1.3 server-side content refactor.
- Homepage DB query fan-out collapsed into one snapshot query.
- Public site no longer polls DB for content revision every 60 seconds.
- Public reads use tagged Next Data Cache and fail-safe fallbacks.
- Root metadata/site shell no longer hit raw DB on every request.

## Preserved
- V3.1.3 CMS stale-write protection.
- Atomic settings writes.
- Program detail white logo plate and `object-contain`.
- Mobile responsive media guardrails.
- V3.1.2 security hardening and session revocation fix.
