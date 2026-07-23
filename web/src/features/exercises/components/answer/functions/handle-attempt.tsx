import { normalizeWord, splitIntoWords } from "#/lib/string-utils";
import type { WordResult } from "../types/word-result";

export function evaluateAttempt(
	userValue: string,
	transcription: string,
): { results: WordResult[]; isHit: boolean } {
	const originalTokens = splitIntoWords(transcription);
	const userTokens = splitIntoWords(userValue);

	const m = originalTokens.length;
	const n = userTokens.length;

	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		Array(n + 1).fill(0),
	);
	const ops: number[][] = Array.from({ length: m + 1 }, () =>
		Array(n + 1).fill(0),
	);

	for (let i = 0; i <= m; i++) {
		dp[i][0] = i;
		ops[i][0] = 3; // missing (deletion)
	}
	for (let j = 0; j <= n; j++) {
		dp[0][j] = j;
		ops[0][j] = 2; // extra (insertion)
	}

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const normOrig = normalizeWord(originalTokens[i - 1]);
			const normUser = normalizeWord(userTokens[j - 1]);

			const isMatch = normOrig.toLowerCase() === normUser.toLowerCase();
			const subCost = isMatch ? 0 : 1;

			const costSub = dp[i - 1][j - 1] + subCost;
			const costDel = dp[i - 1][j] + 1;
			const costIns = dp[i][j - 1] + 1;

			// Prefer match/substitute, then delete, then insert
			let minCost = costSub;
			let op = 1; // 1 = sub/match

			if (costDel < minCost) {
				minCost = costDel;
				op = 3; // 3 = missing
			}
			if (costIns < minCost) {
				minCost = costIns;
				op = 2; // 2 = extra
			}

			dp[i][j] = minCost;
			ops[i][j] = op;
		}
	}

	let i = m;
	let j = n;
	const reversedResults: WordResult[] = [];

	let greens = 0;
	let yellows = 0;
	let reds = 0;

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && ops[i][j] === 1) {
			const rawOriginal = originalTokens[i - 1];
			const rawUser = userTokens[j - 1];
			const normOriginal = normalizeWord(rawOriginal);
			const normUser = normalizeWord(rawUser);

			if (normOriginal === normUser) {
				reversedResults.push({ word: rawOriginal, status: "exact" });
				greens++;
			} else if (normOriginal.toLowerCase() === normUser.toLowerCase()) {
				reversedResults.push({ word: rawOriginal, status: "case" });
				yellows++;
			} else {
				reversedResults.push({ word: rawOriginal, status: "wrong" });
				reds++;
			}
			i--;
			j--;
		} else if (i > 0 && ops[i][j] === 3) {
			// Missing in user input
			reversedResults.push({ word: originalTokens[i - 1], status: "missing" });
			reds++;
			i--;
		} else {
			// Extra in user input (ops === 2)
			// We don't display it, but it counts as an error
			reds++;
			j--;
		}
	}

	const results = reversedResults.reverse();
	const isHit = greens + yellows > reds;

	return { results, isHit };
}
