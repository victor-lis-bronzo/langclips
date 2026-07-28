import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import AnswerBox from "#/features/exercises/components/answer";
import ExercisesHeader from "#/features/exercises/components/header";
import VideoPlayer from "#/features/exercises/components/video-player";
import useCleanUpOldGuesses from "#/features/exercises/hooks/use-clean-up-old-guesses";
import useGetDifficulty from "#/features/exercises/hooks/use-get-difficulty";

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
  }, [cleanUpOldGuesses]);

  return (
    <div className="w-full max-w-5xl flex flex-col gap-2">
      <div className="absolute top-[0%] left-[0%] w-[25%] h-[25%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[0%] w-[25%] h-[25%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
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
