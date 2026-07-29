// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";
import useGetClipBlob from "./use-get-clip-blob";

vi.mock("#/infrastructure/repositories/clip/clip-indexed-db.repository");

describe("useGetClipBlob", () => {
	it("returns clip blob when repository succeeds", async () => {
		const mockBlob = new Blob(["video-data"], { type: "video/mp4" });
		vi.spyOn(
			IndexedDbClipRepository.prototype,
			"getClipBlobById",
		).mockResolvedValue(mockBlob);

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(
			() => useGetClipBlob({ deckId: "deck-1", clipId: "clip-1" }),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data).toBe(mockBlob);
	});

	it("throws error and triggers retry when repository returns null", async () => {
		vi.spyOn(
			IndexedDbClipRepository.prototype,
			"getClipBlobById",
		).mockResolvedValue(null);

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: 1, retryDelay: 10 } },
		});

		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(
			() =>
				useGetClipBlob({
					deckId: "deck-1",
					clipId: "clip-1",
					retry: 1,
					retryDelay: 0,
				}),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeDefined();
		expect(result.current.error?.message).toContain("Clip blob not found");
	});
});
