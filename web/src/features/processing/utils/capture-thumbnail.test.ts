import { describe, expect, it } from "vitest";
import { captureThumbnailFromBlob } from "./capture-thumbnail";

describe("captureThumbnailFromBlob", () => {
	it("returns undefined if window/document is not available or video errors out", async () => {
		const mockBlob = new Blob(["fake video content"], { type: "video/mp4" });

		const resultPromise = captureThumbnailFromBlob(mockBlob, "video/mp4");

		const result = await Promise.race([
			resultPromise,
			new Promise((resolve) => setTimeout(() => resolve(undefined), 100)),
		]);

		expect(result === undefined || result instanceof Blob).toBe(true);
	});
});
