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

	describe("hit rule by difficulty", () => {
		const shortSentence = "I like to drink coffee every day.";
		const shortWithOneWrong = "I like to many coffee every day.";
		const longSentence =
			"The weather is very nice today so we decided to go to the park together";
		const longWithOneWrong =
			"The weather is very nice today so we decided to go to the mark together";

		it("should require every word right on hard (short sentence, one wrong word)", () => {
			expect(
				evaluateAttempt(shortWithOneWrong, shortSentence, "hard").isHit,
			).toBe(false);
		});

		it("should require every word right on hard (long sentence, one wrong word)", () => {
			expect(
				evaluateAttempt(longWithOneWrong, longSentence, "hard").isHit,
			).toBe(false);
		});

		it("should not accept a missing or extra word on hard", () => {
			expect(
				evaluateAttempt("I like to drink coffee every", shortSentence, "hard")
					.isHit,
			).toBe(false);
			expect(
				evaluateAttempt(`${shortSentence} again`, shortSentence, "hard").isHit,
			).toBe(false);
		});

		it("should accept a perfect answer on hard, ignoring case and punctuation", () => {
			expect(
				evaluateAttempt("i like to drink coffee every day", shortSentence, "hard")
					.isHit,
			).toBe(true);
		});

		it("should treat a case-only difference as a hit on hard", () => {
			expect(
				evaluateAttempt("I LIKE to drink coffee every day", shortSentence, "hard")
					.isHit,
			).toBe(true);
		});

		it.each(["easy", "medium"] as const)(
			"should keep the majority rule on %s (one wrong word is still a hit)",
			(difficulty) => {
				expect(
					evaluateAttempt(shortWithOneWrong, shortSentence, difficulty).isHit,
				).toBe(true);
				expect(
					evaluateAttempt(longWithOneWrong, longSentence, difficulty).isHit,
				).toBe(true);
			},
		);

		it("should keep the majority rule when no difficulty is given", () => {
			expect(evaluateAttempt(shortWithOneWrong, shortSentence).isHit).toBe(
				true,
			);
		});
	});
});
