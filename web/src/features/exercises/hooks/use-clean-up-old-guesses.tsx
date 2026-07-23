import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const deckRepository = new IndexedDbStorageRepository();
const exerciseRepository = new IndexedDbExerciseRepository();

type useCleanUpOldGuessesParams = {
	deckId: string;
	clipId: string;
};

export default function useCleanUpOldGuesses({
	deckId,
	clipId,
}: useCleanUpOldGuessesParams) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const deck = await deckRepository.getDeck(deckId);
			const clipPosition = deck?.clips.findIndex((clip) => clip.id === clipId);

			// apaga apenas se for o primeiro exercicio de um nova tentativa
			if (clipPosition === undefined || clipPosition === -1 || clipPosition > 1)
				return false;

			return await exerciseRepository.cleanUp();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["verify-deck-data"] });
		},
	});
}
