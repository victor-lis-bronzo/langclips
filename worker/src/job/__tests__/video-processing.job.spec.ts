import type { Job } from "bullmq";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	MAX_CLIP_DURATION_SECONDS,
	MIN_CLIP_DURATION_SECONDS,
} from "../../config/clip-duration";
import { VideoProcessingJob } from "../video-processing.job";
import type { IAudioExtractorService } from "../../interfaces/audio-extractor.interface";
import type { IClipUploaderService } from "../../interfaces/clip-uploader.interface";
import type { IDeckBuilderService } from "../../interfaces/deck-builder.interface";
import type { IStorageService } from "../../interfaces/storage.interface";
import type { ITranscriptionService } from "../../interfaces/transcription.interface";
import type { IVideoClipperService } from "../../interfaces/video-clipper.interface";
import type { Deck } from "../../types/deck.types";

describe("VideoProcessingJob", () => {
	let storageServiceMock: IStorageService;
	let audioExtractorMock: IAudioExtractorService;
	let transcriberMock: ITranscriptionService;
	let videoClipperMock: IVideoClipperService;
	let clipUploaderMock: IClipUploaderService;
	let deckBuilderMock: IDeckBuilderService;
	let jobMock: Job;
	let jobHandler: VideoProcessingJob;

	beforeEach(() => {
		vi.clearAllMocks();

		storageServiceMock = {
			download: vi.fn().mockResolvedValue({ success: true }),
			upload: vi.fn().mockResolvedValue({ success: true, key: "mock-key" }),
			delete: vi.fn().mockResolvedValue({ success: true }),
		};

		audioExtractorMock = {
			extract: vi.fn().mockResolvedValue({
				success: true,
				outputPath: "/tmp/job-123-audio.mp3",
				startOffset: 0,
			}),
		};

		transcriberMock = {
			transcribe: vi.fn().mockResolvedValue({
				transcriptionData: [
					{ start: 1, end: 5, text: "Valid duration segment 4s" },
					{ start: 10, end: 11, text: "Too short segment 1s" }, // filtered out (< min)
					{ start: 20, end: 50, text: "Too long segment 30s" }, // filtered out (> max)
					{ start: 60, end: 68, text: "Second valid segment 8s" },
				],
			}),
		};

		videoClipperMock = {
			generateClips: vi.fn().mockResolvedValue({
				success: true,
				clips: [
					{
						id: "c-1",
						tempFilePath: "/tmp/c-1.mp4",
						transcription: "Valid duration segment 4s",
						startTime: 1,
						endTime: 5,
					},
					{
						id: "c-2",
						tempFilePath: "/tmp/c-2.mp4",
						transcription: "Second valid segment 8s",
						startTime: 60,
						endTime: 68,
					},
				],
			}),
		};

		clipUploaderMock = {
			upload: vi.fn().mockResolvedValue([
				{
					id: "c-1",
					sourceFileKey: "clips/c-1.mp4",
					transcription: "Valid duration segment 4s",
					startTime: 1,
					endTime: 5,
				},
				{
					id: "c-2",
					sourceFileKey: "clips/c-2.mp4",
					transcription: "Second valid segment 8s",
					startTime: 60,
					endTime: 68,
				},
			]),
		};

		const mockDeck: Deck = {
			id: "job-123",
			sourceFileKey: "videos/input.mp4",
			clips: [],
			createdAt: Date.now(),
		};

		deckBuilderMock = {
			build: vi.fn().mockReturnValue(mockDeck),
		};

		jobMock = {
			id: "job-123",
			data: { fileKey: "videos/input.mp4" },
			updateProgress: vi.fn().mockResolvedValue(undefined),
		} as unknown as Job;

		jobHandler = new VideoProcessingJob(
			storageServiceMock,
			audioExtractorMock,
			transcriberMock,
			videoClipperMock,
			clipUploaderMock,
			deckBuilderMock,
		);
	});

	it("should execute complete video processing pipeline successfully", async () => {
		const result = await jobHandler.execute({ job: jobMock });

		expect(result.status).toBe("success");
		expect(result.deck).toBeDefined();
		expect(result.deck.id).toBe("job-123");

		// Progress steps verification
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "download",
			percentage: 5,
		});
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "audio-extraction",
			percentage: 20,
		});
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "transcription",
			percentage: 40,
		});
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "clip-generation",
			percentage: 60,
		});
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "clip-upload",
			percentage: 75,
		});
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "deck-construction",
			percentage: 85,
		});
		expect(jobMock.updateProgress).toHaveBeenCalledWith({
			step: "deck-upload",
			percentage: 95,
		});

		// Check filtering: only segments within the shared clip duration limits sent to clipper
		expect(videoClipperMock.generateClips).toHaveBeenCalledWith({
			sourceFilePath: expect.stringContaining("job-123-video"),
			requests: [
				{ startTime: 1, endTime: 5, transcription: "Valid duration segment 4s" },
				{ startTime: 60, endTime: 68, transcription: "Second valid segment 8s" },
			],
		});

		// Deck upload to storage
		expect(storageServiceMock.upload).toHaveBeenCalledWith({
			fileKey: "decks/job-123.json",
			body: expect.any(String),
			contentType: "application/json",
		});
	});

	it("should turn a 1.7s phrase into a clip (regression #33)", async () => {
		vi.mocked(transcriberMock.transcribe).mockResolvedValueOnce({
			success: true,
			transcriptionData: [{ start: 10, end: 11.7, text: "Short phrase" }],
		});

		await jobHandler.execute({ job: jobMock });

		expect(videoClipperMock.generateClips).toHaveBeenCalledWith(
			expect.objectContaining({
				requests: [
					{ startTime: 10, endTime: 11.7, transcription: "Short phrase" },
				],
			}),
		);
	});

	it("should respect the shared lower and upper duration bounds", async () => {
		vi.mocked(transcriberMock.transcribe).mockResolvedValueOnce({
			success: true,
			transcriptionData: [
				{ start: 0, end: MIN_CLIP_DURATION_SECONDS - 0.1, text: "below min" },
				{ start: 10, end: 10 + MIN_CLIP_DURATION_SECONDS, text: "at min" },
				{ start: 30, end: 30 + MAX_CLIP_DURATION_SECONDS, text: "at max" },
				{
					start: 60,
					end: 60 + MAX_CLIP_DURATION_SECONDS + 0.1,
					text: "above max",
				},
			],
		});

		await jobHandler.execute({ job: jobMock });

		expect(videoClipperMock.generateClips).toHaveBeenCalledWith(
			expect.objectContaining({
				requests: [
					{
						startTime: 10,
						endTime: 10 + MIN_CLIP_DURATION_SECONDS,
						transcription: "at min",
					},
					{
						startTime: 30,
						endTime: 30 + MAX_CLIP_DURATION_SECONDS,
						transcription: "at max",
					},
				],
			}),
		);
	});

	it("should fail and throw error if storage download fails", async () => {
		vi.mocked(storageServiceMock.download).mockResolvedValueOnce({
			success: false,
		});

		await expect(jobHandler.execute({ job: jobMock })).rejects.toThrow(
			/Falha ao baixar arquivo videos\/input.mp4/,
		);

		expect(audioExtractorMock.extract).not.toHaveBeenCalled();
	});

	it("should fail and throw error if audio extraction fails", async () => {
		vi.mocked(audioExtractorMock.extract).mockResolvedValueOnce({
			success: false,
			outputPath: "",
			startOffset: 0,
		});

		await expect(jobHandler.execute({ job: jobMock })).rejects.toThrow(
			/Falha ao extrair áudio do arquivo videos\/input.mp4/,
		);

		expect(transcriberMock.transcribe).not.toHaveBeenCalled();
	});

	it("should fail and throw error if video clipping fails", async () => {
		vi.mocked(videoClipperMock.generateClips).mockResolvedValueOnce({
			success: false,
			clips: [],
		});

		await expect(jobHandler.execute({ job: jobMock })).rejects.toThrow(
			/Falha ao gerar cortes para o arquivo videos\/input.mp4/,
		);

		expect(clipUploaderMock.upload).not.toHaveBeenCalled();
	});
});
