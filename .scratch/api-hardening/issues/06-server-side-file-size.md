# Issue 06: Server-Side File Size Enforcement (100MB)

**Status:** open
**GitHub Issue:** #29

## Description
Enforce the 100MB file size limit on the server-side. Generate presigned upload URLs/fields with `content-length-range` condition and/or validate `ContentLength` via `headObject` before processing, preventing uploads larger than 100MB from consuming storage or Groq resources. Update web upload integration if necessary.

## Acceptance Criteria
- [ ] Presigned upload mechanism enforces maximum 100MB size (`content-length-range` or validation).
- [ ] `POST /videos/process` checks that the stored file size does not exceed 100MB.
- [ ] Automated tests verify refusal of files larger than 100MB.
- [ ] Web frontend upload integration remains functional and compatible.
