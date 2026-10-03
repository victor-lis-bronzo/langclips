# Issue 03: Anonymous Session & Redis Ownership System

**Status:** resolved
**GitHub Issues:** Foundation for #25, #26, #27

## Description
Implement an anonymous session system with cryptographically signed tokens (`X-Session-Token`) and an `OwnershipService` backed by Redis to track file and deck ownership without requiring user accounts.

## Acceptance Criteria
- [x] Session middleware or guard that validates or issues an HMAC-signed session token.
- [x] `OwnershipService` storing `ownership:<fileKey> -> sessionId` with configurable TTL (e.g. 24h).
- [x] Presigned upload URL generation attaches the caller's session to the requested `fileKey`.
- [x] Unit tests for `SessionGuard`, token generation/verification, and `OwnershipService`.
