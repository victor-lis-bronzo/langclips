import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClipMetadata } from "#/infrastructure/database/indexed-db.types";
import { IndexedDbClipRepository } from "./clip-indexed-db.repository";

describe("IndexedDbClipRepository", () => {
	let repository: IndexedDbClipRepository;
	let mockDb: any;

	const mockBlob = new Blob(["test-video"], { type: "video/mp4" });
	const mockClip: ClipMetadata = {
		id: "clip-1",
		deckId: "deck-1",
		transcription: "Test transcription",
		sourceFileKey: "clips/clip-1.mp4",
		blob: mockBlob,
		mimeType: "video/mp4",
		startTime: 0,
		endTime: 10,
	};

	beforeEach(() => {
		mockDb = {
			put: vi.fn().mockResolvedValue(undefined),
			get: vi.fn(),
			getAll: vi.fn().mockResolvedValue([]),
			clear: vi.fn().mockResolvedValue(undefined),
			transaction: vi.fn(),
		};

		repository = new IndexedDbClipRepository(async () => mockDb);
	});

	it("should save a clip", async () => {
		await repository.saveClip(mockClip);
		expect(mockDb.put).toHaveBeenCalledWith("clips", mockClip);
	});

	it("should get clip blob by id directly from clips store", async () => {
		mockDb.get.mockResolvedValue(mockClip);
		const result = await repository.getClipBlobById("clip-1");
		expect(result).toBe(mockBlob);
		expect(mockDb.get).toHaveBeenCalledWith("clips", "clip-1");
	});

	it("should migrate legacy embedded clip from deck when not found in clips store", async () => {
		mockDb.get.mockResolvedValue(undefined); // Not in clips store
		const legacyDeck = {
			id: "deck-1",
			sourceFileKey: "source.mp4",
			clips: [
				{
					id: "clip-legacy-1",
					transcription: "Legacy clip",
					sourceFileKey: "legacy.mp4",
					blob: mockBlob,
					mimeType: "video/mp4",
					startTime: 0,
					endTime: 5,
				},
			],
			createdAt: 1000,
			downloadedAt: 1000,
			totalSeconds: 5,
		};
		mockDb.getAll.mockResolvedValue([legacyDeck]);

		const result = await repository.getClipBlobById("clip-legacy-1");
		expect(result).toBe(mockBlob);
		expect(mockDb.put).toHaveBeenCalledWith(
			"clips",
			expect.objectContaining({
				id: "clip-legacy-1",
				deckId: "deck-1",
				blob: mockBlob,
			}),
		);
	});

	it("should return null when clip blob is not found anywhere", async () => {
		mockDb.get.mockResolvedValue(undefined);
		mockDb.getAll.mockResolvedValue([]);
		const result = await repository.getClipBlobById("non-existent");
		expect(result).toBeNull();
	});

	it("should get clip by id with position and total metadata", async () => {
		const deck = {
			id: "deck-1",
			clips: [{ id: "clip-1" }, { id: "clip-2" }],
		};
		mockDb.get.mockImplementation((store: string, id: string) => {
			if (store === "decks") return Promise.resolve(deck);
			if (store === "clips") return Promise.resolve(mockClip);
			return Promise.resolve(undefined);
		});

		const result = await repository.getClipById("deck-1", "clip-1");
		expect(result).toEqual({
			...mockClip,
			position: 1,
			total: 2,
		});
	});

	it("should return null if deck does not exist when getting clip by id", async () => {
		mockDb.get.mockResolvedValue(undefined);
		const result = await repository.getClipById("non-existent-deck", "clip-1");
		expect(result).toBeNull();
	});
});
