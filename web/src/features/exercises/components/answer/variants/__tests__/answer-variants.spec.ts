import { describe, expect, it } from "vitest";
import { splitIntoWords } from "#/lib/string-utils";

describe("Exercise Variants Logic & Distractor Tokenization", () => {
	it("should split transcription into words for Word Bank (Easy mode)", () => {
		const transcription = "The quick brown fox jumps over the lazy dog.";
		const words = splitIntoWords(transcription);

		expect(words).toEqual([
			"The",
			"quick",
			"brown",
			"fox",
			"jumps",
			"over",
			"the",
			"lazy",
			"dog.",
		]);
		expect(words.length).toBe(9);
	});

	it("should calculate target visible tokens (~35%) for Fill in the Blanks (Medium mode)", () => {
		const transcription = "I am practicing listening skills with short videos";
		const words = splitIntoWords(transcription);
		const count = words.length; // 8 words

		const targetVisible = Math.max(1, Math.floor(count * 0.35)); // floor(2.8) = 2

		expect(targetVisible).toBe(2);
		expect(count - targetVisible).toBe(6); // 6 hidden input blanks
	});
});
