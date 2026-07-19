import { BaseIndexedDbRepository } from "#/infrastructure/database/base-indexed-db.repository";
import type { Exercise } from "#/infrastructure/database/indexed-db.types";
import type { IExerciseStorageRepository } from "./exercise.repository.interface";

export class IndexedDbExerciseRepository
  extends BaseIndexedDbRepository
  implements IExerciseStorageRepository
{
  async saveExercise(exercise: Exercise): Promise<void> {
    const db = await this.getDb();
    await db.put("exercises", exercise);
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    const db = await this.getDb();
    const exercise = await db.get("exercises", id);
    return exercise || null;
  }

  async getExercisesByClipId(clipId: string): Promise<Exercise[]> {
    const db = await this.getDb();
    const index = db.transaction("exercises", "readonly").store.index("clipId");
    return index.getAll(clipId);
  }

  async getExercisesByDeckId(deckId: string): Promise<Exercise[]> {
    const db = await this.getDb();
    const index = db.transaction("exercises", "readonly").store.index("deckId");
    return index.getAll(deckId);
  }

  async getAllExercises(): Promise<Exercise[]> {
    const db = await this.getDb();
    return db.getAll("exercises");
  }

  async cleanUp(): Promise<void> {
    const db = await this.getDb();
    await db.clear("exercises");
  }
}
