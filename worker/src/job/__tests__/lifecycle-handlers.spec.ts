import { describe, expect, it, vi } from "vitest";
import os from "node:os";
import path from "node:path";
import type { IDiskCleanupService } from "../../interfaces/disk-cleanup.interface";
import {
  handleJobCompleted,
  handleJobFailed,
  type LifecycleJob,
} from "../lifecycle-handlers";

describe("Worker Lifecycle Handlers", () => {
  it("should trigger cleanup on job completion", async () => {
    const cleanupMock = vi.fn().mockResolvedValue(undefined);
    const diskCleanup: IDiskCleanupService = {
      cleanup: cleanupMock,
    };

    const job: LifecycleJob = {
      id: "job-123",
      attemptsMade: 1,
      opts: { attempts: 3 },
    };

    await handleJobCompleted(job, diskCleanup);

    const tmpDir = os.tmpdir();
    expect(cleanupMock).toHaveBeenCalledTimes(1);
    expect(cleanupMock).toHaveBeenCalledWith({
      paths: [
        path.join(tmpDir, "job-123-video"),
        path.join(tmpDir, "job-123-audio.mp3"),
      ],
    });
  });

  it("should NOT trigger cleanup on recoverable failure (attemptsMade < attempts)", async () => {
    const cleanupMock = vi.fn().mockResolvedValue(undefined);
    const diskCleanup: IDiskCleanupService = {
      cleanup: cleanupMock,
    };

    const job: LifecycleJob = {
      id: "job-456",
      attemptsMade: 1,
      opts: { attempts: 3 },
    };

    const result = await handleJobFailed(
      job,
      new Error("Temporary Groq timeout"),
      diskCleanup,
    );

    expect(result.cleaned).toBe(false);
    expect(cleanupMock).not.toHaveBeenCalled();
  });

  it("should trigger cleanup on final failure (attemptsMade >= attempts)", async () => {
    const cleanupMock = vi.fn().mockResolvedValue(undefined);
    const diskCleanup: IDiskCleanupService = {
      cleanup: cleanupMock,
    };

    const job: LifecycleJob = {
      id: "job-789",
      attemptsMade: 3,
      opts: { attempts: 3 },
    };

    const result = await handleJobFailed(
      job,
      new Error("Fatal error: max retries reached"),
      diskCleanup,
    );

    expect(result.cleaned).toBe(true);
    const tmpDir = os.tmpdir();
    expect(cleanupMock).toHaveBeenCalledTimes(1);
    expect(cleanupMock).toHaveBeenCalledWith({
      paths: [
        path.join(tmpDir, "job-789-video"),
        path.join(tmpDir, "job-789-audio.mp3"),
      ],
    });
  });

  it("should handle undefined job safely in handleJobFailed", async () => {
    const cleanupMock = vi.fn().mockResolvedValue(undefined);
    const diskCleanup: IDiskCleanupService = {
      cleanup: cleanupMock,
    };

    const result = await handleJobFailed(
      undefined,
      new Error("Unexpected error without job"),
      diskCleanup,
    );

    expect(result.cleaned).toBe(false);
    expect(cleanupMock).not.toHaveBeenCalled();
  });
});
