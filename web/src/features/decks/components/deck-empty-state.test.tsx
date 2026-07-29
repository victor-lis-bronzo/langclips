// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeckEmptyState } from "./deck-empty-state";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
}));

describe("DeckEmptyState", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders empty state title and action link", () => {
		render(<DeckEmptyState />);
		expect(screen.getByText("No Decks Found")).toBeTruthy();
		expect(screen.getByText("Create First Deck")).toBeTruthy();
	});
});
