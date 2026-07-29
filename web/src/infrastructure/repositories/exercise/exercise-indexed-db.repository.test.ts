import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Exercise } from "#/infrastructure/database/indexed-db.types";
import { IndexedDbExerciseRepository } from "./exercise-indexed-db.repository";

describe("IndexedDbExerciseRepository", () => {
	let repository: IndexedDbExerciseRepository;
	let mockDb: Record<string, unknown>;

	const mockExercises: Exercise[] = [
		{
			id: "ex-1",
			deckId: "deck-1",
			clipId: "clip-1",
			createdAt: 1000,
			timeSpentMs: 5000,
			doneAt: 2000,
			difficulty: "easy",
			status: "CORRECT",
		},
		{
			id: "ex-2",
			deckId: "deck-1",
			clipId: "clip-2",
			createdAt: 3000,
			timeSpentMs: 6000,
			doneAt: 4000,
			difficulty: "medium",
			status: "WRONG",
		},
		{
			id: "ex-3",
			deckId: "deck-2",
			clipId: "clip-3",
			createdAt: 5000,
			timeSpentMs: 7000,
			doneAt: 6000,
			difficulty: "hard",
			status: "CORRECT",
		},
	];

	beforeEach(() => {
		mockDb = {
			put: vi.fn(),
			get: vi.fn(),
			getAll: vi.fn().mockResolvedValue(mockExercises),
			clear: vi.fn(),
			transaction: vi.fn(),
		};

		repository = new IndexedDbExerciseRepository(async () => mockDb);
	});

	it("should save an exercise", async () => {
		const exercise = mockExercises[0];
		await repository.saveExercise(exercise);
		expect(mockDb.put).toHaveBeenCalledWith("exercises", exercise);
	});

	it("should get exercise by id", async () => {
		mockDb.get.mockResolvedValue(mockExercises[0]);
		const result = await repository.getExerciseById("ex-1");
		expect(result).toEqual(mockExercises[0]);
		expect(mockDb.get).toHaveBeenCalledWith("exercises", "ex-1");
	});

	it("should return null if exercise not found by id", async () => {
		mockDb.get.mockResolvedValue(undefined);
		const result = await repository.getExerciseById("non-existent");
		expect(result).toBeNull();
	});

	it("should delete exercises by deckId using cursor", async () => {
		const delete1 = vi.fn();
		const delete2 = vi.fn();

		const cursor2 = {
			delete: delete2,
			continue: vi.fn().mockResolvedValue(null),
		};

		const cursor1 = {
			delete: delete1,
			continue: vi.fn().mockResolvedValue(cursor2),
		};

		const openCursorMock = vi.fn().mockResolvedValue(cursor1);
		const indexMock = { openCursor: openCursorMock };
		const storeMock = { index: vi.fn().mockReturnValue(indexMock) };
		const txMock = { store: storeMock, done: Promise.resolve() };

		mockDb.transaction.mockReturnValue(txMock);

		await repository.deleteExercisesByDeckId("deck-1");

		expect(mockDb.transaction).toHaveBeenCalledWith("exercises", "readwrite");
		expect(storeMock.index).toHaveBeenCalledWith("deckId");
		expect(openCursorMock).toHaveBeenCalledWith("deck-1");
		expect(delete1).toHaveBeenCalled();
		expect(delete2).toHaveBeenCalled();
	});
});
