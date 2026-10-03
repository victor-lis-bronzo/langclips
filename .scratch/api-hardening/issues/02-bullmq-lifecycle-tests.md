# Issue 02: BullMQ Queue Lifecycle & Retry Behavior Tests

**Status:** resolved
**GitHub Issue:** #24

## Description
Write automated tests verifying BullMQ default job options (`attempts`, `backoff`, `removeOnComplete`, `removeOnFail`) in the API module, and worker lifecycle listeners (`failed` keeping temp files on retry, `failed` performing cleanup on final attempt exhaustion).

## Acceptance Criteria
- [x] Unit tests for `AppModule` or queue provider confirming BullMQ retry and cleanup options.
- [x] Unit tests for Worker failed/completed lifecycle handlers verifying disk retention on retry and disk cleanup on final failure.
- [x] 100% tests passing.
