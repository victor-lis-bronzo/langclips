import { cleanString } from "#/lib/string-utils";
import type { WordResult } from "../types/word-result";

export function evaluateAttempt(
  userValue: string,
  transcription: string,
): { results: WordResult[]; isHit: boolean } {
  const originalWords = cleanString(transcription);
  const userWords = cleanString(userValue);

  const maxLength = Math.max(originalWords.length, userWords.length);
  const results: WordResult[] = [];

  let greens = 0;
  let yellows = 0;
  let reds = 0;

  for (let i = 0; i < originalWords.length; i++) {
    const originalWord = originalWords[i] || "";
    const userWord = userWords[i] || "";

    if (!userWord) {
      results.push({ word: originalWord, status: "missing" });
      reds++;
    } else if (originalWord === userWord) {
      results.push({ word: originalWord, status: "exact" });
      greens++;
    } else if (originalWord.toLowerCase() === userWord.toLowerCase()) {
      results.push({ word: originalWord, status: "case" });
      yellows++;
    } else {
      results.push({ word: originalWord, status: "wrong" });
      reds++;
    }
  }

  for (let i = originalWords.length; i < userWords.length; i++) {
    reds++;
  }

  const isHit = greens + yellows > reds;
  return { results, isHit };
}
