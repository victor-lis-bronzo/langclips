# Specification: API Hardening, Security, Pipeline Test Coverage & Infra

## Overview
This specification addresses 8 GitHub issues (#24 to #31) encompassing:
1. **#24**: BullMQ queue lifecycle, retry/backoff validation, and cleanup behavior in the worker.
2. **#25**: IDOR and broken access control prevention in `POST /videos/acknowledge-download`.
3. **#26**: IDOR prevention in `GET /storage/download-url`.
4. **#27**: Throttling and ownership/storage validation in `POST /videos/process`.
5. **#28**: Admin authentication (Basic Auth) on `/admin/queues` and strict CORS origins.
6. **#29**: Server-side 100MB file size enforcement on presigned upload and processing.
7. **#30**: Test coverage for worker pipeline services and fixing API E2E teardown to run in CI.
8. **#31**: Full local development stack configuration in `infra/compose.yml`.

---

## Architecture & Design Details

### 1. Anonymous Ownership System (`SessionGuard` & `OwnershipService`)
Because LangClips is an anonymous application without user accounts:
- Sessions are identified via a cryptographically signed HMAC token (`X-Session-Token` header or `Authorization: Bearer`).
- If no token is provided by a client, the API automatically generates one (`POST /sessions` or transparent generation middleware/header).
- `OwnershipService` records keys in Redis with a 24-hour TTL:
  - `ownership:<fileKey> -> sessionId`
- Presigned URL generation registers `videos/<uuid>-<name>` to the caller's session.
- `videos/process` ensures `fileKey` belongs to the caller's session, and registers ownership for the resulting `decks/<jobId>.json` and derived clips (`clips/<jobId>/...`).
- `GET /storage/download-url` and `POST /videos/acknowledge-download` verify ownership. If ownership does not match the active session, HTTP `403 Forbidden` is thrown.

### 2. Rate Limiting (`@nestjs/throttler`)
- Global throttler module configured.
- `POST /videos/process` is throttled with a strict limit: 5 requests per minute per IP / session.
- `storageService.headObject(fileKey)` verifies the file exists and is accessible before queueing.

### 3. Server-Side File Size Enforcement (100MB)
- Storage presigned generation uses `createPresignedPost` (or presigned PUT with size constraints / `headObject` validation) rejecting uploads exceeding 100MB (104,857,600 bytes).
- `videos/process` validates that `headObject.ContentLength <= 100 * 1024 * 1024`, throwing `400 Bad Request` if violated.
- Web frontend's `submit-to-r2.ts` is updated to post to R2 using the presigned fields/conditions or compatible payload.

### 4. Bull Board Authentication & CORS Hardening
- `/admin/queues` is protected with HTTP Basic Authentication (`BULL_BOARD_USER` / `BULL_BOARD_PASSWORD`). Constant-time string comparison (`timingSafeEqual`) prevents timing attacks.
- Boot-time validation: if `ENABLE_BULL_BOARD=true` and credentials are missing, server throws an error during bootstrap.
- CORS: In production (`NODE_ENV === 'production'`), `CORS_ORIGINS` must be explicitly specified and non-empty.

### 5. Worker Test Coverage & CI E2E Teardown
- Fix `api/test/app.e2e-spec.ts`: close BullMQ queue connection and fastify app properly in `afterAll`.
- Update `.github/workflows/verify.yml` to include a Redis service container and execute `pnpm run test:e2e` for the `api` project.
- Comprehensive unit tests in `worker/src/services/__tests__/` and `worker/src/job/__tests__/`:
  - `VideoProcessingJob`
  - `FFmpegVideoClipperService`
  - `DeckBuilderService`
  - `ClipUploaderService`
  - `FFmpegAudioChunkerService`
  - Worker error handling & retry retention in `videoWorker.on('failed')`.

### 6. Local Docker Compose
- `infra/compose.yml` updated with `api` and `worker` services building from local codebases, linked to `redis`.
