import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import { useQuery } from "@tanstack/react-query";

const exercisesRepository = new IndexedDbExerciseRepository();
export function useGetDeckExercises({ deckId }: { deckId: string }) {
  return useQuery({
    queryKey: ["deck-exercises", deckId],
    queryFn: async () => await exercisesRepository.getExercisesByDeckId(deckId),
    enabled: !!deckId,
  });
}
