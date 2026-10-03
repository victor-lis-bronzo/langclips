# Issue 04: IDOR Prevention in Download URL & Acknowledge Download

**Status:** resolved
**GitHub Issues:** #25, #26

## Description
Enforce ownership checks on `GET /storage/download-url` and `POST /videos/acknowledge-download`. Requests for files not belonging to the active session must return HTTP 403 Forbidden.

## Acceptance Criteria
- [x] `StorageController.getDownloadUrl` checks ownership via `OwnershipService` and throws `ForbiddenException` (403) if unauthorized.
- [x] `VideosController.acknowledgeDownload` verifies all `fileKeys` belong to the session before deleting, throwing 403 if any key belongs to another session.
- [x] Unit & E2E tests simulating legitimate access and unauthorized cross-session attempts.
