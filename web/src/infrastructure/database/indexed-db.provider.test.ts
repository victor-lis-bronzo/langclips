import { describe, expect, it, vi } from "vitest";
import { handleDbUpgrade } from "./indexed-db.provider";

describe("handleDbUpgrade", () => {
	it("creates decks, clips and exercises stores for fresh install (oldVersion = 0)", () => {
		const existingStores = new Set<string>();
		const createdStores: string[] = [];

		const mockDb = {
			objectStoreNames: {
				contains: (name: string) => existingStores.has(name),
			},
			createObjectStore: vi.fn().mockImplementation((name: string) => {
				existingStores.add(name);
				createdStores.push(name);
				return { createIndex: vi.fn() };
			}),
		};

		handleDbUpgrade(mockDb as any, 0, 3);

		expect(createdStores).toContain("decks");
		expect(createdStores).toContain("clips");
		expect(createdStores).toContain("exercises");
	});

	it("creates clips store when upgrading from v2 to v3", () => {
		// Simula v2 onde existiam 'decks' e 'exercises', mas não 'clips'
		const existingStores = new Set<string>(["decks", "exercises"]);
		const createdStores: string[] = [];

		const mockDb = {
			objectStoreNames: {
				contains: (name: string) => existingStores.has(name),
			},
			createObjectStore: vi.fn().mockImplementation((name: string) => {
				existingStores.add(name);
				createdStores.push(name);
				return { createIndex: vi.fn() };
			}),
		};

		handleDbUpgrade(mockDb as any, 2, 3);

		expect(createdStores).toContain("clips");
		expect(mockDb.createObjectStore).toHaveBeenCalledWith("clips", {
			keyPath: "id",
		});
	});
});
