// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import useCleanUpOldGuesses from "./use-clean-up-old-guesses";

vi.mock("#/infrastructure/repositories/deck/deck-indexed-db.repository");
vi.mock(
	"#/infrastructure/repositories/exercise/exercise-indexed-db.repository",
);

const deck = {
	id: "deck-1",
	clips: [{ id: "clip-1" }, { id: "clip-2" }, { id: "clip-3" }],
};

type StoredExercise = { id: string; deckId: string; clipId: string };

let store: StoredExercise[];
let cleanUpSpy: ReturnType<typeof vi.spyOn>;
let invalidateSpy: ReturnType<typeof vi.spyOn>;

async function openClip(clipId: string) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
	const { result } = renderHook(
		() => useCleanUpOldGuesses({ deckId: "deck-1", clipId }),
		{ wrapper },
	);

	await act(async () => {
		result.current.mutate();
	});
	await waitFor(() => expect(result.current.isSuccess).toBe(true));
}

describe("useCleanUpOldGuesses", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		store = [];
		vi.spyOn(IndexedDbStorageRepository.prototype, "getDeck").mockResolvedValue(
			deck as never,
		);
		cleanUpSpy = vi
			.spyOn(IndexedDbExerciseRepository.prototype, "cleanUp")
			.mockImplementation(async () => {
				store = [];
				return true as never;
			});
		vi.spyOn(
			IndexedDbExerciseRepository.prototype,
			"getExercisesByDeckId",
		).mockImplementation(
			async (deckId: string) =>
				store.filter((e) => e.deckId === deckId) as never,
		);
	});

	it("clears previous guesses when starting a new attempt (1st clip)", async () => {
		store = [{ id: "old", deckId: "deck-1", clipId: "clip-1" }];

		await openClip("clip-1");

		expect(cleanUpSpy).toHaveBeenCalledTimes(1);
		expect(store).toEqual([]);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["verify-deck-data"],
		});
	});

	it.each([
		"clip-2",
		"clip-3",
	])("keeps previous guesses when opening %s", async (clipId) => {
		await openClip(clipId);

		expect(cleanUpSpy).not.toHaveBeenCalled();
	});

	it("results contain both clips after answering clip 1 and opening clip 2", async () => {
		await openClip("clip-1");
		store.push({ id: "ex-1", deckId: "deck-1", clipId: "clip-1" });

		await openClip("clip-2");
		store.push({ id: "ex-2", deckId: "deck-1", clipId: "clip-2" });

		const results =
			await new IndexedDbExerciseRepository().getExercisesByDeckId("deck-1");
		expect(results.map((e) => e.clipId)).toEqual(["clip-1", "clip-2"]);
	});
});
