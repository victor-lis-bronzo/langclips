import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";

const deckRepository = new IndexedDbStorageRepository();
const clipRepository = new IndexedDbClipRepository();
const exerciseRepository = new IndexedDbExerciseRepository();

export function useDeleteDeck() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (deckId: string) => {
			await deckRepository.deleteDeck(deckId);
			await clipRepository.deleteClipsByDeck(deckId);
			await exerciseRepository.deleteExercisesByDeckId(deckId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["decks"] });
			queryClient.invalidateQueries({ queryKey: ["has-existent-deck"] });
			queryClient.invalidateQueries({ queryKey: ["verify-deck-data"] });
		},
	});
}
