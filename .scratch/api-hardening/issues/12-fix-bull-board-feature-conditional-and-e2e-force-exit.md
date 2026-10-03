# 12: Conditional BullBoardFeatureModule & E2E Force Exit

**What to build:**
1. Make `BullBoardModule.forFeature` conditional in `videos.module.ts` on `process.env.ENABLE_BULL_BOARD === 'true'` (matching `app.module.ts`) so NestJS does not throw dependency errors when Bull Board is disabled.
2. Add `--forceExit` to `test:e2e` in `api/package.json` and ensure graceful teardown in `api/test/app.e2e-spec.ts` so Jest does not hang on lingering Redis connections.

**Blocked by:** None

**Status:** resolved

## Acceptance Criteria
- [x] `videos.module.ts` imports `BullBoardModule.forFeature` only when `process.env.ENABLE_BULL_BOARD === 'true'`.
- [x] `api/test/app.e2e-spec.ts` compiles and runs cleanly without `bull_board_instance` resolution errors.
- [x] `api/package.json` `test:e2e` exits cleanly with `--forceExit`.
- [x] Local and CI `pnpm --filter api run test:e2e` pass with 0 errors.
- [x] Lint and typecheck pass across all packages with 0 warnings.
