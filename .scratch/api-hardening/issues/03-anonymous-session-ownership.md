# Issue 03: Anonymous Session & Redis Ownership System

**Status:** open
**GitHub Issues:** Foundation for #25, #26, #27

## Description
Implement an anonymous session system with cryptographically signed tokens (`X-Session-Token`) and an `OwnershipService` backed by Redis to track file and deck ownership without requiring user accounts.

## Acceptance Criteria
- [ ] Session middleware or guard that validates or issues an HMAC-signed session token.
- [ ] `OwnershipService` storing `ownership:<fileKey> -> sessionId` with configurable TTL (e.g. 24h).
- [ ] Presigned upload URL generation attaches the caller's session to the requested `fileKey`.
- [ ] Unit tests for `SessionGuard`, token generation/verification, and `OwnershipService`.
