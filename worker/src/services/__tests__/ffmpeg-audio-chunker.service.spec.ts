import fluentFfmpeg from "fluent-ffmpeg";
import * as fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FFmpegAudioChunkerService } from "../ffmpeg-audio-chunker.service";

vi.mock("fluent-ffmpeg");
vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		readdirSync: vi.fn(),
	};
});

describe("FFmpegAudioChunkerService", () => {
	let service: FFmpegAudioChunkerService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new FFmpegAudioChunkerService();
	});

	it("should split audio into chunks using ffmpeg segment options", async () => {
		const mockCommand = {
			outputOptions: vi.fn().mockReturnThis(),
			output: vi.fn().mockReturnThis(),
			on: vi.fn().mockImplementation(function (
				this: Record<string, unknown>,
				event: string,
				callback: (err?: Error) => void,
			) {
				if (event === "end") {
					setTimeout(() => callback(), 10);
				}
				return this;
			}),
			run: vi.fn(),
		};

		vi.mocked(fluentFfmpeg).mockReturnValue(
			mockCommand as unknown as fluentFfmpeg.FfmpegCommand,
		);

		// Mock readdirSync to return matching chunk files
		vi.mocked(fs.readdirSync).mockImplementation((_dir: unknown) => {
			return ["chunk-000.mp3", "chunk-001.mp3"] as unknown as string[];
		});

		// We can spy on startsWith or mock output file names
		vi.spyOn(String.prototype, "startsWith").mockImplementation(function (
			this: string,
			prefix: string,
		) {
			if (prefix.length > 10) return true; // match uuid
			return this.indexOf(prefix) === 0;
		});

		const result = await service.chunkAudio({
			audioPath: "/tmp/source.mp3",
			chunkDurationSeconds: 30,
		});

		expect(result.success).toBe(true);
		expect(result.chunks).toBeDefined();
		expect(mockCommand.outputOptions).toHaveBeenCalledWith([
			"-f segment",
			"-segment_time 30",
			"-c copy",
		]);
		expect(mockCommand.run).toHaveBeenCalled();
	});

	it("should throw when ffmpeg segmentation fails", async () => {
		const mockCommand = {
			outputOptions: vi.fn().mockReturnThis(),
			output: vi.fn().mockReturnThis(),
			on: vi.fn().mockImplementation(function (
				this: Record<string, unknown>,
				event: string,
				callback: (err?: Error) => void,
			) {
				if (event === "error") {
					setTimeout(() => callback(new Error("FFmpeg segment error")), 10);
				}
				return this;
			}),
			run: vi.fn(),
		};

		vi.mocked(fluentFfmpeg).mockReturnValue(
			mockCommand as unknown as fluentFfmpeg.FfmpegCommand,
		);

		await expect(
			service.chunkAudio({
				audioPath: "/tmp/invalid.mp3",
				chunkDurationSeconds: 15,
			}),
		).rejects.toThrow("FFmpeg segment error");
	});
});
