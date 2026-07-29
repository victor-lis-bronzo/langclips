import axios from "axios";
import fs from "node:fs";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAudioChunkerService } from "../../interfaces/audio-chunker.interface";
import { WhisperTranscriptionService } from "../whisper-transcription.service";

vi.mock("axios");
vi.mock("fs");

describe("WhisperTranscriptionService", () => {
	let service: WhisperTranscriptionService;
	let mockAudioChunker: IAudioChunkerService;

	beforeEach(() => {
		vi.clearAllMocks();

		mockAudioChunker = {
			chunkAudio: vi.fn(),
		};

		service = new WhisperTranscriptionService("test-api-key", mockAudioChunker);

		vi.mocked(fs.statSync).mockReturnValue({
			size: 10 * 1024 * 1024, // 10MB (under 24MB limit)
		} as unknown as fs.Stats);

		vi.mocked(fs.createReadStream).mockReturnValue(
			Readable.from(["test"]) as unknown as fs.ReadStream,
		);
		vi.mocked(fs.existsSync).mockReturnValue(true);
	});

	it("should successfully transcribe audio using word-level timestamps when available", async () => {
		const mockWhisperResponse = {
			data: {
				text: "Hello world. This is a test.",
				words: [
					{ word: "Hello", start: 0.0, end: 0.5 },
					{ word: "world.", start: 0.6, end: 1.2 },
					{ word: "This", start: 1.5, end: 1.8 },
					{ word: "is", start: 1.9, end: 2.1 },
					{ word: "a", start: 2.2, end: 2.3 },
					{ word: "test.", start: 2.4, end: 3.5 },
				],
				segments: [],
			},
		};

		vi.mocked(axios.post).mockResolvedValue(mockWhisperResponse);

		const result = await service.transcribe({ audioPath: "/tmp/audio.mp3" });

		expect(result.success).toBe(true);
		expect(result.transcriptionData.length).toBeGreaterThan(0);
		expect(axios.post).toHaveBeenCalledWith(
			"https://api.groq.com/openai/v1/audio/transcriptions",
			expect.any(Object),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer test-api-key",
				}),
			}),
		);
	});

	it("should throw an error on catastrophic API failure (500 or Timeout) to trigger BullMQ retry", async () => {
		const apiError = new Error("Request failed with status code 500");
		vi.mocked(axios.post).mockRejectedValue(apiError);

		await expect(
			service.transcribe({ audioPath: "/tmp/audio.mp3" }),
		).rejects.toThrow("Request failed with status code 500");
	});

	it("should chunk audio and clean up chunk files if audio file is larger than 24MB", async () => {
		vi.mocked(fs.statSync).mockReturnValue({
			size: 30 * 1024 * 1024, // 30MB (over 24MB limit)
		} as unknown as fs.Stats);

		mockAudioChunker.chunkAudio = vi.fn().mockResolvedValue({
			chunks: [
				{ path: "/tmp/chunk1.mp3", startTimeOffset: 0 },
				{ path: "/tmp/chunk2.mp3", startTimeOffset: 600 },
			],
		});

		vi.mocked(axios.post).mockResolvedValue({
			data: {
				text: "Sample text",
				segments: [
					{
						id: 1,
						seek: 0,
						start: 0,
						end: 5,
						text: "Sample text.",
						tokens: [],
						temperature: 0,
						avg_logprob: -0.2,
						compression_ratio: 1.2,
						no_speech_prob: 0.1,
					},
				],
			},
		});

		const result = await service.transcribe({
			audioPath: "/tmp/large_audio.mp3",
		});

		expect(mockAudioChunker.chunkAudio).toHaveBeenCalledWith({
			audioPath: "/tmp/large_audio.mp3",
			chunkDurationSeconds: 600,
		});

		expect(result.success).toBe(true);
		expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/chunk1.mp3");
		expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/chunk2.mp3");
	});
});
