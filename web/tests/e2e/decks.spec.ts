import { expect, test } from "@playwright/test";

async function clearAndSeedDeck(page: any, deckData?: any) {
	// Navigate to home first to set same-origin context for IndexedDB
	await page.goto("/", { waitUntil: "domcontentloaded" });

	await page.evaluate(async (data: any) => {
		return new Promise<void>((resolve, reject) => {
			try {
				const req = indexedDB.open("langclips-local", 3);
				req.onupgradeneeded = (e: any) => {
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
				req.onsuccess = (e: any) => {
					const db = e.target.result;
					db.onversionchange = () => db.close();

					const tx = db.transaction("decks", "readwrite");
					const store = tx.objectStore("decks");
					store.clear();
					if (data) {
						store.put(data);
					}
					tx.oncomplete = () => {
						db.close();
						resolve();
					};
					tx.onerror = (err: any) => {
						db.close();
						reject(String(err?.target?.error?.message || "Transaction error"));
					};
				};
				req.onerror = (err: any) => {
					reject(String(err?.target?.error?.message || "Open DB error"));
				};
				req.onblocked = () => {
					reject("Open DB blocked");
				};
			} catch (err: any) {
				reject(String(err?.message || err));
			}
		});
	}, deckData);
}

test.describe("Decks Screen E2E", () => {
	test("should display empty state when no decks are saved", async ({ page }) => {
		await clearAndSeedDeck(page, null);
		await page.goto("/decks", { waitUntil: "domcontentloaded" });

		await expect(
			page.getByRole("heading", { name: "My Decks" }),
		).toBeVisible();
		await expect(page.getByText("No Decks Found")).toBeVisible();
		await expect(page.getByText("Create First Deck")).toBeVisible();
	});

	test("should list saved decks in grid", async ({ page }) => {
		await clearAndSeedDeck(page, {
			id: "deck-e2e-1",
			sourceFileKey: "key-1",
			clips: [{ id: "clip-1", deckId: "deck-e2e-1" }],
			createdAt: Date.now(),
			downloadedAt: Date.now(),
			totalSeconds: 125,
		});

		await page.goto("/decks", { waitUntil: "domcontentloaded" });

		await expect(page.getByText("1 clip")).toBeVisible();
		await expect(page.getByText("~02m 05s")).toBeVisible();
	});

	test("should navigate to difficulty screen when clicking a deck card", async ({ page }) => {
		await clearAndSeedDeck(page, {
			id: "deck-nav-test",
			sourceFileKey: "key-2",
			clips: [{ id: "clip-2", deckId: "deck-nav-test" }],
			createdAt: Date.now(),
			downloadedAt: Date.now(),
			totalSeconds: 45,
		});

		await page.goto("/decks", { waitUntil: "domcontentloaded" });

		await page.getByText("1 clip").click();
		await expect(page).toHaveURL(/\/difficulty\/deck-nav-test/);
	});
});
