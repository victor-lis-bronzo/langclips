// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlertExistentDeckDialog } from "./alert-existent-deck-dialog";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
}));

vi.mock("../hooks/use-has-existent-decks", () => ({
	useHasExistentDecks: vi.fn(),
}));

vi.mock("../hooks/use-cleanup-existent-data", () => ({
	useCleanUpExistentData: () => ({
		mutateAsync: vi.fn().mockResolvedValue(true),
	}),
}));

import { useHasExistentDecks } from "../hooks/use-has-existent-decks";

describe("AlertExistentDeckDialog", () => {
	afterEach(() => {
		cleanup();
	});

	it("does not render when hasDecks is false", () => {
		vi.mocked(useHasExistentDecks).mockReturnValue({ data: false } as any);

		const { container } = render(<AlertExistentDeckDialog />);
		expect(container.firstChild).toBeNull();
	});

	it("renders dialog when hasDecks is true", () => {
		vi.mocked(useHasExistentDecks).mockReturnValue({ data: true } as any);

		render(<AlertExistentDeckDialog />);
		expect(screen.getByText("You already have saved decks!")).toBeTruthy();
		expect(screen.getByText("Go to decks")).toBeTruthy();
		expect(screen.getByText("Continue Here")).toBeTruthy();
	});
});
