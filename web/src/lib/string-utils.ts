/**
 * Cleans a string by removing punctuation, trimming whitespace,
 * and splitting it into an array of words.
 */
export function cleanString(str: string): string[] {
  return str
    .replace(/[.,!?()[\]{}"':;]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
