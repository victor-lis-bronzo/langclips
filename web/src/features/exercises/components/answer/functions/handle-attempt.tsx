import { normalizeWord, splitIntoWords } from "#/lib/string-utils";
import type { WordResult } from "../types/word-result";

export function evaluateAttempt(
  userValue: string,
  transcription: string,
): { results: WordResult[]; isHit: boolean } {
  const originalTokens = splitIntoWords(transcription);
  const userTokens = splitIntoWords(userValue);

  const results: WordResult[] = [];

  let greens = 0;
  let yellows = 0;
  let reds = 0;

  for (let i = 0; i < originalTokens.length; i++) {
    const rawOriginal = originalTokens[i] || "";
    const rawUser = userTokens[i] || "";

    const normOriginal = normalizeWord(rawOriginal);
    const normUser = normalizeWord(rawUser);

    if (!rawUser) {
      results.push({ word: rawOriginal, status: "missing" });
      reds++;
    } else if (normOriginal === normUser) {
      results.push({ word: rawOriginal, status: "exact" });
      greens++;
    } else if (normOriginal.toLowerCase() === normUser.toLowerCase()) {
      results.push({ word: rawOriginal, status: "case" });
      yellows++;
    } else {
      results.push({ word: rawOriginal, status: "wrong" });
      reds++;
    }
  }

  for (let i = originalTokens.length; i < userTokens.length; i++) {
    reds++;
  }

  const isHit = greens + yellows > reds;
  return { results, isHit };
}

