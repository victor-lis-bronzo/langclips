// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import { useDeleteDeck } from "./use-delete-deck";

vi.mock("#/infrastructure/repositories/deck/deck-indexed-db.repository");
vi.mock("#/infrastructure/repositories/clip/clip-indexed-db.repository");
vi.mock(
	"#/infrastructure/repositories/exercise/exercise-indexed-db.repository",
);

describe("useDeleteDeck", () => {
	it("deletes deck, clips and exercises", async () => {
		const deleteDeckSpy = vi
			.spyOn(IndexedDbStorageRepository.prototype, "deleteDeck")
			.mockResolvedValue(undefined);
		const deleteClipsSpy = vi
			.spyOn(IndexedDbClipRepository.prototype, "deleteClipsByDeck")
			.mockResolvedValue(undefined);
		const deleteExercisesSpy = vi
			.spyOn(IndexedDbExerciseRepository.prototype, "deleteExercisesByDeckId")
			.mockResolvedValue(undefined);

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useDeleteDeck(), { wrapper });

		await act(async () => {
			result.current.mutate("target-deck-id");
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(deleteDeckSpy).toHaveBeenCalledWith("target-deck-id");
		expect(deleteClipsSpy).toHaveBeenCalledWith("target-deck-id");
		expect(deleteExercisesSpy).toHaveBeenCalledWith("target-deck-id");
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["decks"] });
	});
});
