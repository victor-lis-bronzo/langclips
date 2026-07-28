// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DeckRecord } from "#/infrastructure/database/indexed-db.types";
import { DeckCard } from "./deck-card";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

vi.mock("../hooks/use-delete-deck", () => ({
	useDeleteDeck: () => ({
		mutate: vi.fn(),
		isPending: false,
	}),
}));

vi.mock(
	"#/infrastructure/repositories/clip/clip-indexed-db.repository",
	() => ({
		IndexedDbClipRepository: vi.fn().mockImplementation(function (this: any) {
			this.getClipBlobById = vi.fn().mockResolvedValue(null);
		}),
	}),
);

vi.mock(
	"#/infrastructure/repositories/deck/deck-indexed-db.repository",
	() => ({
		IndexedDbStorageRepository: vi.fn().mockImplementation(function (
			this: any,
		) {
			this.saveDeck = vi.fn().mockResolvedValue(undefined);
		}),
	}),
);

describe("DeckCard", () => {
	afterEach(() => {
		cleanup();
	});

	const mockDeck: DeckRecord = {
		id: "deck-123",
		sourceFileKey: "file-key",
		clips: [
			{
				id: "c1",
				deckId: "deck-123",
				transcription: "hi",
				sourceFileKey: "s1",
				startTime: 0,
				endTime: 5,
			},
			{
				id: "c2",
				deckId: "deck-123",
				transcription: "bye",
				sourceFileKey: "s2",
				startTime: 5,
				endTime: 10,
			},
		],
		createdAt: 1774000000000,
		downloadedAt: 1774000000000,
		totalSeconds: 65,
	};

	it("renders clips count and formatted duration", () => {
		render(<DeckCard deck={mockDeck} />);
		expect(screen.getByText("2 clips")).toBeTruthy();
		expect(screen.getByText("~01m 05s")).toBeTruthy();
	});

	it("shows fallback icon when thumbnailBlob is missing", () => {
		render(<DeckCard deck={mockDeck} />);
		expect(screen.getByText("No Frame Preview")).toBeTruthy();
	});
});
