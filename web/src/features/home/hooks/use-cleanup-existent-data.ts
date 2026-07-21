import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";
import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

const deckRepository = new IndexedDbStorageRepository();
const clipRepository = new IndexedDbClipRepository();
const exerciseRepository = new IndexedDbExerciseRepository();

export function useCleanUpExistentData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await Promise.all([
        deckRepository.cleanUp(),
        clipRepository.cleanUp(),
        exerciseRepository.cleanUp(),
      ])
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["verify-deck-data"] });
          queryClient.invalidateQueries({ queryKey: ["decks"] });
          queryClient.invalidateQueries({ queryKey: ["clips"] });
          queryClient.invalidateQueries({ queryKey: ["exercises"] });
          return true;
        })
        .catch((error) => {
          console.error(error);
          return false;
        });
    },
  });
}
