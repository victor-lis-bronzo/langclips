import { describe, it, expect, vi, beforeEach } from "vitest";
import { R2StorageService } from "../r2-storage.service";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

vi.mock("fs", () => ({
  default: {
    createWriteStream: vi.fn().mockReturnValue({}),
  },
  createWriteStream: vi.fn().mockReturnValue({}),
}));

vi.mock("stream/promises", () => ({
  pipeline: vi.fn().mockResolvedValue(undefined),
}));

describe("R2StorageService", () => {
  let mockS3Client: S3Client;
  let service: R2StorageService;
  const bucketName = "test-bucket";

  beforeEach(() => {
    mockS3Client = {
      send: vi.fn(),
    } as unknown as S3Client;

    service = new R2StorageService(mockS3Client, bucketName);
  });

  it("should send GetObjectCommand when downloading", async () => {
    const mockSend = vi.fn().mockResolvedValue({ Body: {} });
    mockS3Client.send = mockSend;

    const result = await service.download({
      fileKey: "video.mp4",
      destinationPath: "/tmp/video.mp4",
    });

    expect(result.success).toBe(true);
    expect(result.downloadedFilePath).toBe("/tmp/video.mp4");
    expect(mockSend).toHaveBeenCalledWith(expect.any(GetObjectCommand));

    const commandCall = mockSend.mock.calls[0][0];
    expect(commandCall.input.Bucket).toBe(bucketName);
    expect(commandCall.input.Key).toBe("video.mp4");
  });

  it("should send PutObjectCommand when uploading", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    mockS3Client.send = mockSend;

    const result = await service.upload({
      fileKey: "clip.mp4",
      body: Buffer.from("test"),
      contentType: "video/mp4",
    });

    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));

    const commandCall = mockSend.mock.calls[0][0];
    expect(commandCall.input.Bucket).toBe(bucketName);
    expect(commandCall.input.Key).toBe("clip.mp4");
    expect(commandCall.input.ContentType).toBe("video/mp4");
  });

  it("should send DeleteObjectCommand when deleting", async () => {
    const mockSend = vi.fn().mockResolvedValue({});
    mockS3Client.send = mockSend;

    const result = await service.delete({ fileKey: "old-file.mp4" });

    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));

    const commandCall = mockSend.mock.calls[0][0];
    expect(commandCall.input.Bucket).toBe(bucketName);
    expect(commandCall.input.Key).toBe("old-file.mp4");
  });
});
