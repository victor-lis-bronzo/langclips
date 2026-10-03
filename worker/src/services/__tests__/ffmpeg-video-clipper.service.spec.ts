import fluentFfmpeg from "fluent-ffmpeg";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FFmpegVideoClipperService } from "../ffmpeg-video-clipper.service";
import type { ClipCreationRequest } from "../../interfaces/video-clipper.interface";

vi.mock("fluent-ffmpeg");

describe("FFmpegVideoClipperService", () => {
	let service: FFmpegVideoClipperService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new FFmpegVideoClipperService();
	});

	it("should generate video clips for valid requests", async () => {
		const mockCommand = {
			setStartTime: vi.fn().mockReturnThis(),
			setDuration: vi.fn().mockReturnThis(),
			outputOptions: vi.fn().mockReturnThis(),
			output: vi.fn().mockReturnThis(),
			on: vi.fn().mockImplementation(function (
				this: Record<string, unknown>,
				event: string,
				callback: (val?: unknown) => void,
			) {
				if (event === "start") {
					callback("ffmpeg command line");
				}
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

		const requests: ClipCreationRequest[] = [
			{
				startTime: 10,
				endTime: 15,
				transcription: "First phrase",
			},
			{
				startTime: 20,
				endTime: 28,
				transcription: "Second phrase",
			},
		];

		const result = await service.generateClips({
			sourceFilePath: "/tmp/source.mp4",
			requests,
		});

		expect(result.success).toBe(true);
		expect(result.clips).toHaveLength(2);
		expect(mockCommand.setStartTime).toHaveBeenCalledWith(10);
		expect(mockCommand.setDuration).toHaveBeenCalledWith(5);
		expect(mockCommand.setStartTime).toHaveBeenCalledWith(20);
		expect(mockCommand.setDuration).toHaveBeenCalledWith(8);
		expect(result.clips[0].transcription).toBe("First phrase");
		expect(result.clips[1].transcription).toBe("Second phrase");
	});

	it("should continue processing remaining clips if one fails", async () => {
		let executionIndex = 0;
		vi.mocked(fluentFfmpeg).mockImplementation(() => {
			const index = ++executionIndex;
			let endCb: (() => void) | undefined;
			let errCb: ((err: Error) => void) | undefined;

			const cmd: Record<string, unknown> = {
				setStartTime: vi.fn().mockReturnThis(),
				setDuration: vi.fn().mockReturnThis(),
				outputOptions: vi.fn().mockReturnThis(),
				output: vi.fn().mockReturnThis(),
				on: vi.fn().mockImplementation((event: string, cb: unknown) => {
					if (event === "end") endCb = cb as () => void;
					if (event === "error") errCb = cb as (err: Error) => void;
					return cmd;
				}),
				run: vi.fn().mockImplementation(() => {
					setTimeout(() => {
						if (index === 1 && errCb) {
							errCb(new Error("Clip 1 failed"));
						} else if (endCb) {
							endCb();
						}
					}, 10);
				}),
			};
			return cmd as unknown as fluentFfmpeg.FfmpegCommand;
		});

		const requests: ClipCreationRequest[] = [
			{ startTime: 0, endTime: 5, transcription: "Fail clip" },
			{ startTime: 10, endTime: 15, transcription: "Success clip" },
		];

		const result = await service.generateClips({
			sourceFilePath: "/tmp/source.mp4",
			requests,
		});

		expect(result.success).toBe(true);
		expect(result.clips).toHaveLength(1);
		expect(result.clips[0].transcription).toBe("Success clip");
	});

	it("should return success: false when all clips fail", async () => {
		const mockCommand = {
			setStartTime: vi.fn().mockReturnThis(),
			setDuration: vi.fn().mockReturnThis(),
			outputOptions: vi.fn().mockReturnThis(),
			output: vi.fn().mockReturnThis(),
			on: vi.fn().mockImplementation(function (
				this: Record<string, unknown>,
				event: string,
				callback: (val?: unknown) => void,
			) {
				if (event === "error") {
					setTimeout(() => callback(new Error("FFmpeg error")), 10);
				}
				return this;
			}),
			run: vi.fn(),
		};

		vi.mocked(fluentFfmpeg).mockReturnValue(
			mockCommand as unknown as fluentFfmpeg.FfmpegCommand,
		);

		const result = await service.generateClips({
			sourceFilePath: "/tmp/source.mp4",
			requests: [{ startTime: 0, endTime: 5, transcription: "Fail" }],
		});

		expect(result.success).toBe(false);
		expect(result.clips).toHaveLength(0);
	});
});
