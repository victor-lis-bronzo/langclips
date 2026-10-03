# Issue 09: Local Docker Compose Full Stack Configuration

**Status:** resolved
**GitHub Issue:** #31

## Description
Update `infra/compose.yml` to include `api` and `worker` services building from local codebases (`api/Dockerfile` and `worker/Dockerfile`), wired to `redis`, enabling a complete local stack startup with `docker compose up`.

## Acceptance Criteria
- [x] `infra/compose.yml` configures `redis`, `api`, and `worker` services.
- [x] Proper environment files and volume / tmpfs configurations set.
- [x] `docker compose -f infra/compose.yml config` passes validation without syntax errors.
