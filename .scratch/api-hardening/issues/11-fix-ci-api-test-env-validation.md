# 11: Fix CI API Test Environment Validation for AppModule

**What to build:** Provide default mock environment variables for standalone test runs and configure the `Test` step in `.github/workflows/verify.yml` so `src/app.module.spec.ts` passes validation in headless CI environments without missing environment variable crashes.

**Blocked by:** None (can start immediately)

**Status:** resolved

## Acceptance Criteria
- [x] `api/src/app.module.spec.ts` configures fallback test environment variables before module import/evaluation.
- [x] `.github/workflows/verify.yml` includes test environment variables on the `Test` step.
- [x] `pnpm --filter api run test` passes cleanly in an empty environment.
- [x] 0 lint and 0 typecheck warnings in `api`.
