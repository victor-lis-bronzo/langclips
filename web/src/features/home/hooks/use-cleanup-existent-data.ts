import { QueryClient, useMutation } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";
import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

export function useCleanUpExistentData() {
  const deckRepository = new IndexedDbStorageRepository();
  const clipRepository = new IndexedDbClipRepository();
  const exerciseRepository = new IndexedDbExerciseRepository();

  const queryClient = new QueryClient();

  return useMutation({
    mutationFn: async () => {
      return await Promise.all([
        deckRepository.cleanUp(),
        clipRepository.cleanUp(),
        exerciseRepository.cleanUp(),
      ])
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["verify-deck-data"] });
          return true;
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
    },
  });
}
