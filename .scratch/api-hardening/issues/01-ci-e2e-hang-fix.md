# Issue 01: CI E2E Teardown Fix & Workflow Redis Service

**Status:** resolved
**GitHub Issue:** #30 (part 1)

## Description
Fix the hanging `test:e2e` in the API project by properly closing BullMQ connections and Fastify instances during Jest teardown (`afterAll`). Update `.github/workflows/verify.yml` to spin up a Redis service container for the `api` project quality check and execute `pnpm run test:e2e`.

## Acceptance Criteria
- [x] `api/test/app.e2e-spec.ts` closes the BullMQ queue and Nest application cleanly without hanging open handles.
- [x] `.github/workflows/verify.yml` includes Redis service container and runs `pnpm run test:e2e` for the `api` project.
- [x] `pnpm --filter api run test:e2e` completes cleanly with 0 hangs or leaks.
