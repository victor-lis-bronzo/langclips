import { expect, test } from "@playwright/test";

test.describe("Decks Screen E2E", () => {
	test("should display empty state when no decks are saved", async ({ page }) => {
		await page.goto("/decks");

		// Clear IndexedDB decks if any
		await page.evaluate(async () => {
			indexedDB.deleteDatabase("langclips-local");
		});

		await page.reload();

		await expect(page.getByText("My Decks")).toBeVisible();
		await expect(page.getByText("No Decks Found")).toBeVisible();
		await expect(page.getByText("Create First Deck")).toBeVisible();
	});

	test("should list saved decks in grid", async ({ page }) => {
		await page.goto("/decks");

		// Seed IndexedDB with a mock deck
		await page.evaluate(async () => {
			const request = indexedDB.open("langclips-local", 3);
			request.onupgradeneeded = (e: any) => {
				const db = e.target.result;
				if (!db.objectStoreNames.contains("decks")) {
					db.createObjectStore("decks", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("clips")) {
					db.createObjectStore("clips", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("exercises")) {
					const store = db.createObjectStore("exercises", { keyPath: "id" });
					store.createIndex("deckId", "deckId");
					store.createIndex("clipId", "clipId");
				}
			};

			await new Promise((resolve) => {
				request.onsuccess = (e: any) => {
					const db = e.target.result;
					const tx = db.transaction("decks", "readwrite");
					tx.objectStore("decks").put({
						id: "deck-e2e-1",
						sourceFileKey: "key-1",
						clips: [{ id: "clip-1", deckId: "deck-e2e-1" }],
						createdAt: Date.now(),
						downloadedAt: Date.now(),
						totalSeconds: 125,
					});
					tx.oncomplete = resolve;
				};
			});
		});

		await page.reload();

		await expect(page.getByText("1 clip")).toBeVisible();
		await expect(page.getByText("~02m 05s")).toBeVisible();
	});

	test("should navigate to difficulty screen when clicking a deck card", async ({ page }) => {
		await page.goto("/decks");

		// Seed IndexedDB
		await page.evaluate(async () => {
			const request = indexedDB.open("langclips-local", 3);
			request.onupgradeneeded = (e: any) => {
				const db = e.target.result;
				if (!db.objectStoreNames.contains("decks")) {
					db.createObjectStore("decks", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("clips")) {
					db.createObjectStore("clips", { keyPath: "id" });
				}
				if (!db.objectStoreNames.contains("exercises")) {
					const store = db.createObjectStore("exercises", { keyPath: "id" });
					store.createIndex("deckId", "deckId");
					store.createIndex("clipId", "clipId");
				}
			};

			await new Promise((resolve) => {
				request.onsuccess = (e: any) => {
					const db = e.target.result;
					const tx = db.transaction("decks", "readwrite");
					tx.objectStore("decks").put({
						id: "deck-nav-test",
						sourceFileKey: "key-2",
						clips: [{ id: "clip-2", deckId: "deck-nav-test" }],
						createdAt: Date.now(),
						downloadedAt: Date.now(),
						totalSeconds: 45,
					});
					tx.oncomplete = resolve;
				};
			});
		});

		await page.reload();

		await page.getByText("1 clip").click();
		await expect(page).toHaveURL(/\/difficulty\/deck-nav-test/);
	});
});
