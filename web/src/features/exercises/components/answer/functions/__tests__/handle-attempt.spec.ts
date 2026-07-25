import { describe, expect, it } from "vitest";
import { evaluateAttempt } from "../handle-attempt";

describe("evaluateAttempt (Dictation Engine)", () => {
	it("should return exact match when input matches transcription perfectly", () => {
		const { results, isHit } = evaluateAttempt("Hello world", "Hello world");
		expect(isHit).toBe(true);
		expect(results).toEqual([
			{ word: "Hello", status: "exact" },
			{ word: "world", status: "exact" },
		]);
	});

	it("should match case-insensitively and ignore punctuation differences", () => {
		const { results, isHit } = evaluateAttempt("hello, world", "Hello, world!");
		expect(isHit).toBe(true);
		expect(results[0].status).toBe("case");
		expect(results[1].status).toBe("exact");
	});

	it("should identify wrong words and return isHit: false when errors exceed hits", () => {
		const { results, isHit } = evaluateAttempt("Applee piee", "Apple pie");
		expect(isHit).toBe(false);
		expect(
			results.some((r) => r.status === "wrong" || r.status === "missing"),
		).toBe(true);
	});

	it("should handle missing words in user input", () => {
		const { results } = evaluateAttempt("Hello", "Hello world");
		expect(results).toEqual([
			{ word: "Hello", status: "exact" },
			{ word: "world", status: "missing" },
		]);
	});
});
