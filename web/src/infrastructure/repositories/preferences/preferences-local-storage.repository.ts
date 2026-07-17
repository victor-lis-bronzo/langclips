import type { ILocalStorageRepository } from "./preferences.repository.interface";

export class LocalStorageRepository implements ILocalStorageRepository {
  getDifficulty(): "easy" | "medium" | "hard" | undefined {
    return localStorage.getItem("difficulty") as
      | "easy"
      | "medium"
      | "hard"
      | undefined;
  }

  setDifficulty(difficulty: "easy" | "medium" | "hard"): void {
    localStorage.setItem("difficulty", difficulty);
  }
}
