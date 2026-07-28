// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { useHasExistentDecks } from "./use-has-existent-decks";

vi.mock("#/infrastructure/repositories/deck/deck-indexed-db.repository");

describe("useHasExistentDecks", () => {
	it("returns false when no decks exist", async () => {
		vi.spyOn(
			IndexedDbStorageRepository.prototype,
			"getAllDecks",
		).mockResolvedValue([]);

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useHasExistentDecks(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBe(false);
	});

	it("returns true when decks exist", async () => {
		vi.spyOn(
			IndexedDbStorageRepository.prototype,
			"getAllDecks",
		).mockResolvedValue([{ id: "deck-1" } as any]);

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useHasExistentDecks(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBe(true);
	});
});
