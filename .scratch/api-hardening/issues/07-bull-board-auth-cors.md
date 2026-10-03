# Issue 07: Bull Board Basic Authentication & Strict CORS

**Status:** open
**GitHub Issue:** #28

## Description
Secure `/admin/queues` route with HTTP Basic Authentication using constant-time comparison. Fail fast if Bull Board is enabled without admin credentials configured. Require explicit `CORS_ORIGINS` in production and deny open wildcard CORS.

## Acceptance Criteria
- [ ] Basic Authentication hook/guard protecting `/admin/queues/*` with timing-safe comparison.
- [ ] Fast failure during application bootstrap if `ENABLE_BULL_BOARD=true` and credentials (`BULL_BOARD_USER`, `BULL_BOARD_PASSWORD`) are empty.
- [ ] Strict CORS origin checking: origins must match whitelist; no open wildcards allowed in production.
- [ ] Tests verify 401 for unauthenticated/wrong admin access and blocked disallowed origins.
