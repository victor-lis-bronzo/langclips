import useGetDeckById from "../hooks/use-get-deck-by-id";
import { ProgressDots, type DotStatus } from "./progress-dots";
import { useGetDeckExercises } from "#/features/results/hooks/use-get-deck-exercises";

interface ExercisesHeaderProps {
	deckId: string;
	clipId: string;
}

export default function ExercisesHeader({
	deckId,
	clipId,
}: ExercisesHeaderProps) {
	const { data: deck } = useGetDeckById({ deckId });
	const { data: exercises } = useGetDeckExercises({ deckId });

	const actualExerciseNumber =
		(deck?.clips.findIndex((c) => c.id === clipId) ?? -1) + 1 || 1;
	const totalExercises = deck?.clips.length ?? 0;

	const statuses: DotStatus[] =
		deck?.clips.map((clip, index) => {
			const clipExercises =
				exercises?.filter((e) => e.clipId === clip.id) ?? [];
			const latestExercise = clipExercises.sort(
				(a, b) => (b.doneAt || b.createdAt) - (a.doneAt || a.createdAt),
			)[0];

			let status: "correct" | "wrong" | "unanswered" = "unanswered";
			if (latestExercise) {
				status = latestExercise.status === "CORRECT" ? "correct" : "wrong";
			}

			return {
				num: index + 1,
				status,
			};
		}) ?? [];

	return (
		<div className="flex w-full justify-between items-center mb-2">
			<h1 className="font-medium">{`Clip ${actualExerciseNumber} of ${totalExercises}`}</h1>
			<ProgressDots
				current={actualExerciseNumber}
				total={totalExercises}
				statuses={statuses}
			/>
		</div>
	);
}
