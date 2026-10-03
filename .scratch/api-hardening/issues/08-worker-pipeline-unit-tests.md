# Issue 08: Worker Pipeline Unit & Integration Test Coverage

**Status:** open
**GitHub Issue:** #30 (part 2)

## Description
Write comprehensive automated unit and integration tests for the video processing pipeline services in the worker: `VideoProcessingJob`, `FFmpegVideoClipperService`, `DeckBuilderService`, `ClipUploaderService`, and `FFmpegAudioChunkerService`.

## Acceptance Criteria
- [ ] Unit tests for `VideoProcessingJob` covering sequence of steps, progress emission, and error handling.
- [ ] Unit tests for `FFmpegVideoClipperService` covering clip boundaries and error scenarios.
- [ ] Unit tests for `DeckBuilderService` verifying clip structuring, blank generation and metadata formatting.
- [ ] Unit tests for `ClipUploaderService` verifying S3/R2 uploads.
- [ ] Unit tests for `FFmpegAudioChunkerService` verifying chunk generation and split logic.
- [ ] 100% of worker tests passing.
