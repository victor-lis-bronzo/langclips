import { expect, test } from "@playwright/test";

async function seedDeckAndClip(
	page: any,
	deckData: any,
	hasClip: boolean = false,
) {
	await page.goto("/");

	await page.evaluate(
		async ({ deck, createClip }: { deck: any; createClip: boolean }) => {
			return new Promise<void>((resolve, reject) => {
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
					const tx = db.transaction(["decks", "clips"], "readwrite");
					const deckStore = tx.objectStore("decks");
					const clipStore = tx.objectStore("clips");
					deckStore.clear();
					clipStore.clear();

					if (deck) {
						deckStore.put(deck);
					}
					if (createClip && deck && deck.clips && deck.clips[0]) {
						const sampleBlob = new Blob(["fake-mp4-video-content"], {
							type: "video/mp4",
						});
						clipStore.put({
							id: deck.clips[0].id,
							deckId: deck.id,
							transcription: deck.clips[0].transcription,
							sourceFileKey: deck.clips[0].sourceFileKey,
							blob: sampleBlob,
							mimeType: "video/mp4",
							startTime: 0,
							endTime: 5,
						});
					}

					tx.oncomplete = () => {
						db.close();
						resolve();
					};
					tx.onerror = () => {
						db.close();
						reject(tx.error);
					};
				};
				req.onerror = () => reject(req.error);
			});
		},
		{ deck: deckData, createClip: hasClip },
	);
}

test.describe("Exercises Screen E2E", () => {
	test("should render video player when clip blob exists in IDB", async ({
		page,
	}) => {
		const deck = {
			id: "deck-e2e-exercises",
			sourceFileKey: "key-1",
			clips: [
				{
					id: "clip-e2e-1",
					deckId: "deck-e2e-exercises",
					transcription: "Test clip transcription",
					sourceFileKey: "clips/clip-1.mp4",
					startTime: 0,
					endTime: 5,
				},
			],
			createdAt: Date.now(),
			downloadedAt: Date.now(),
			totalSeconds: 5,
		};

		await seedDeckAndClip(page, deck, true);

		await page.goto("/exercises/deck-e2e-exercises/clip-e2e-1");

		// The video element should be present and visible
		await expect(page.locator("video")).toBeVisible();
		// "Could not load video" should NOT be visible
		await expect(page.getByText("Could not load video")).not.toBeVisible();
	});

	test("should show error state when clip is not found in IDB", async ({
		page,
	}) => {
		await seedDeckAndClip(page, null, false);

		await page.goto("/exercises/invalid-deck/invalid-clip");

		await expect(page.getByText("Could not load video")).toBeVisible();
	});
});
