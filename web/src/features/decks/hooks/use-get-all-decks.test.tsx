// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { useGetAllDecks } from "./use-get-all-decks";

vi.mock("#/infrastructure/repositories/deck/deck-indexed-db.repository");

describe("useGetAllDecks", () => {
	it("returns list of decks from repository", async () => {
		const mockDecks = [
			{
				id: "deck-1",
				sourceFileKey: "key-1",
				clips: [],
				createdAt: 1000,
				downloadedAt: 1000,
				totalSeconds: 65,
			},
		];

		vi.spyOn(
			IndexedDbStorageRepository.prototype,
			"getAllDecks",
		).mockResolvedValue(
			mockDecks as unknown as Awaited<
				ReturnType<typeof IndexedDbStorageRepository.prototype.getAllDecks>
			>,
		);

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useGetAllDecks(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toEqual(mockDecks);
	});
});
