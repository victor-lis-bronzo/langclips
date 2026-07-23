import type { Exercise } from "#/infrastructure/database/indexed-db.types";

export interface IExerciseStorageRepository {
	saveExercise(exercise: Exercise): Promise<void>;
	getExerciseById(id: string): Promise<Exercise | null>;
	getExercisesByClipId(clipId: string): Promise<Exercise[]>;
	getExercisesByDeckId(deckId: string): Promise<Exercise[]>;
	getAllExercises(): Promise<Exercise[]>;
	cleanUp(): Promise<void>;
}
