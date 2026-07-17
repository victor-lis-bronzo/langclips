export type DifficultyType = "easy" | "medium" | "hard";

export interface ILocalStorageRepository {
  getDifficulty(): DifficultyType | undefined;
  setDifficulty(difficulty: DifficultyType): void;
}
