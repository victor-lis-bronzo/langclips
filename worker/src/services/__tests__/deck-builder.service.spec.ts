import { describe, expect, it } from "vitest";
import { DeckBuilderService } from "../deck-builder.service";
import type { Clip } from "../../types/deck.types";

describe("DeckBuilderService", () => {
	const service = new DeckBuilderService();

	it("should construct a valid deck with metadata and mapped clips", () => {
		const uploadedClips: Clip[] = [
			{
				id: "clip-1",
				sourceFileKey: "clips/clip-1.mp4",
				transcription: "Hello world",
				startTime: 10,
				endTime: 15,
			},
			{
				id: "clip-2",
				sourceFileKey: "clips/clip-2.mp4",
				transcription: "Learning languages",
				startTime: 20,
				endTime: 25,
			},
		];

		const deck = service.build({
			jobId: "job-999",
			sourceFileKey: "videos/test-source.mp4",
			uploadedClips,
		});

		expect(deck).toBeDefined();
		expect(deck.id).toBe("job-999");
		expect(deck.sourceFileKey).toBe("videos/test-source.mp4");
		expect(deck.clips).toHaveLength(2);
		expect(deck.clips[0]).toEqual({
			id: "clip-1",
			sourceFileKey: "clips/clip-1.mp4",
			transcription: "Hello world",
			startTime: 10,
			endTime: 15,
		});
		expect(deck.createdAt).toBeGreaterThan(0);
	});

	it("should handle empty clips list gracefully", () => {
		const deck = service.build({
			jobId: "job-empty",
			sourceFileKey: "videos/empty.mp4",
			uploadedClips: [],
		});

		expect(deck.id).toBe("job-empty");
		expect(deck.clips).toEqual([]);
		expect(typeof deck.createdAt).toBe("number");
	});
});
