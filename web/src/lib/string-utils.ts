/**
 * Splits a string by whitespace into tokens, preserving raw punctuation and casing.
 */
export function splitIntoWords(str: string): string[] {
  return str.trim().split(/\s+/).filter(Boolean);
}

/**
 * Normalizes a single word for comparison by removing punctuation, quotes, and apostrophes.
 */
export function normalizeWord(word: string): string {
  return word
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[.,!?()[\]{}"':;\u201C\u201D]/g, "");
}

/**
 * Cleans a string by removing punctuation, trimming whitespace,
 * and splitting it into an array of words.
 */
export function cleanString(str: string): string[] {
  return splitIntoWords(str).map(normalizeWord).filter(Boolean);
}

