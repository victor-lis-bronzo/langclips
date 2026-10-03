# 10: Fix Worker fs.readdirSync Typecheck on Linux

**What to build:** Fix the mock type signature of `fs.readdirSync` in `worker/src/services/__tests__/ffmpeg-audio-chunker.service.spec.ts` so `pnpm run typecheck` passes cleanly across all platforms including Ubuntu CI runners without overload mismatch errors.

**Blocked by:** None (can start immediately)

**Status:** resolved

## Acceptance Criteria
- [x] `worker/src/services/__tests__/ffmpeg-audio-chunker.service.spec.ts` compiles without type errors in `pnpm run typecheck`.
- [x] All 29 worker tests pass with 100% success.
- [x] 0 lint and 0 typecheck warnings in `worker`.
