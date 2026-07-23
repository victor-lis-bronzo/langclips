import { createFileRoute } from "@tanstack/react-router";
import ExercisesHeader from "#/features/exercises/components/header";
import VideoPlayer from "#/features/exercises/components/video-player";
import AnswerBox from "#/features/exercises/components/answer";
import useGetDifficulty from "#/features/exercises/hooks/use-get-difficulty";
import { useEffect } from "react";
import useCleanUpOldGuesses from "#/features/exercises/hooks/use-clean-up-old-guesses";

export const Route = createFileRoute("/exercises/$deckId/$clipId")({
	component: ExercisesRoute,
});

function ExercisesRoute() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4 md:p-8">
			<ExercisesComponent />
		</div>
	);
}

function ExercisesComponent() {
	const { deckId, clipId } = Route.useParams();
	const { data: difficulty } = useGetDifficulty();
	const { mutate: cleanUpOldGuesses } = useCleanUpOldGuesses({
		deckId,
		clipId,
	});

	useEffect(() => {
		cleanUpOldGuesses();
	}, []);

	return (
		<div className="w-full max-w-5xl flex flex-col gap-2">
			<ExercisesHeader deckId={deckId} clipId={clipId} />
			<div className="flex w-full flex-col lg:flex-row gap-2">
				<VideoPlayer deckId={deckId} clipId={clipId} />
				<AnswerBox
					variant={difficulty || "easy"}
					deckId={deckId}
					clipId={clipId}
				/>
			</div>
		</div>
	);
}
