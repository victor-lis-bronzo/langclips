# Issue 05: Throttling & Validation in Video Processing

**Status:** open
**GitHub Issue:** #27

## Description
Protect `POST /videos/process` by implementing strict rate limiting using `@nestjs/throttler` (5 req/min), validating `fileKey` ownership, and verifying existence in the storage bucket before adding the job to BullMQ.

## Acceptance Criteria
- [ ] Throttler configured on `POST /videos/process` (limit: 5 req/min). Returns HTTP 429 when exceeded.
- [ ] Endpoint validates that `fileKey` belongs to caller's session (403 if unauthorized).
- [ ] Endpoint verifies object exists in storage via `headObject` (404/400 if missing).
- [ ] Unit & integration tests for rate limiting and validation rules.
