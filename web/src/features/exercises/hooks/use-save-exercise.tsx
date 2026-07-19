import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndexedDbExerciseRepository } from "#/infrastructure/repositories/exercise/exercise-indexed-db.repository";
import type { Exercise } from "#/infrastructure/database/indexed-db.types";

export default function useSaveExercise() {
	const queryClient = useQueryClient();
	const exerciseIndexDbRepository = new IndexedDbExerciseRepository();

	return useMutation({
		mutationFn: (exercise: Exercise) =>
			exerciseIndexDbRepository.saveExercise(exercise),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["exercises", variables.deckId],
			});
			queryClient.invalidateQueries({
				queryKey: ["exercises", variables.clipId],
			});
		},
	});
}
