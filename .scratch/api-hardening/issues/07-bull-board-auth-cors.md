# Issue 07: Bull Board Basic Authentication & Strict CORS

**Status:** resolved
**GitHub Issue:** #28

## Description
Secure `/admin/queues` route with HTTP Basic Authentication using constant-time comparison. Fail fast if Bull Board is enabled without admin credentials configured. Require explicit `CORS_ORIGINS` in production and deny open wildcard CORS.

## Acceptance Criteria
- [x] Basic Authentication hook/guard protecting `/admin/queues/*` with timing-safe comparison.
- [x] Fast failure during application bootstrap if `ENABLE_BULL_BOARD=true` and credentials (`BULL_BOARD_USER`, `BULL_BOARD_PASSWORD`) are empty.
- [x] Strict CORS origin checking: origins must match whitelist; no open wildcards allowed in production.
- [x] Tests verify 401 for unauthenticated/wrong admin access and blocked disallowed origins.
