import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClipUploaderService } from "../clip-uploader.service";
import type { IStorageService } from "../../interfaces/storage.interface";
import type { LocalGeneratedClip } from "../../interfaces/video-clipper.interface";

vi.mock("node:fs/promises");

describe("ClipUploaderService", () => {
	let storageServiceMock: IStorageService;
	let service: ClipUploaderService;

	beforeEach(() => {
		vi.clearAllMocks();
		storageServiceMock = {
			download: vi.fn(),
			upload: vi.fn().mockResolvedValue({ success: true, key: "clips/mock.mp4" }),
			delete: vi.fn(),
		};
		service = new ClipUploaderService(storageServiceMock);
	});

	it("should read clip files and upload each to storage service", async () => {
		const fakeBuffer = Buffer.from("fake-video-bytes");
		vi.mocked(fs.readFile).mockResolvedValue(fakeBuffer);

		const localClips: LocalGeneratedClip[] = [
			{
				id: "clip-a",
				tempFilePath: "/tmp/clip-a.mp4",
				transcription: "First sentence",
				startTime: 0,
				endTime: 5,
			},
			{
				id: "clip-b",
				tempFilePath: "/tmp/clip-b.mp4",
				transcription: "Second sentence",
				startTime: 6,
				endTime: 10,
			},
		];

		const result = await service.upload(localClips);

		expect(result).toHaveLength(2);
		expect(fs.readFile).toHaveBeenCalledTimes(2);
		expect(fs.readFile).toHaveBeenCalledWith("/tmp/clip-a.mp4");
		expect(fs.readFile).toHaveBeenCalledWith("/tmp/clip-b.mp4");

		expect(storageServiceMock.upload).toHaveBeenCalledTimes(2);
		expect(result[0].id).toBe("clip-a");
		expect(result[0].sourceFileKey).toMatch(/^clips\/[a-f0-9-]+\.mp4$/);
		expect(result[0].transcription).toBe("First sentence");
		expect(result[0].startTime).toBe(0);
		expect(result[0].endTime).toBe(5);
	});

	it("should throw error when reading file fails", async () => {
		vi.mocked(fs.readFile).mockRejectedValueOnce(new Error("File not found on disk"));

		const localClips: LocalGeneratedClip[] = [
			{
				id: "clip-fail",
				tempFilePath: "/tmp/missing.mp4",
				transcription: "Missing",
				startTime: 0,
				endTime: 5,
			},
		];

		await expect(service.upload(localClips)).rejects.toThrow(
			/Falha ao enviar o clip clip-fail para o Storage/,
		);
	});

	it("should throw error when storage upload fails", async () => {
		vi.mocked(fs.readFile).mockResolvedValue(Buffer.from("bytes"));
		vi.mocked(storageServiceMock.upload).mockRejectedValueOnce(
			new Error("S3 network timeout"),
		);

		const localClips: LocalGeneratedClip[] = [
			{
				id: "clip-upload-fail",
				tempFilePath: "/tmp/clip.mp4",
				transcription: "Timeout",
				startTime: 0,
				endTime: 5,
			},
		];

		await expect(service.upload(localClips)).rejects.toThrow(
			/S3 network timeout/,
		);
	});
});
