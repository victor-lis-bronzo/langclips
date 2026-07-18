import ExercisesHeader from "#/features/exercises/header";
import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <ExercisesHeader deckId={deckId} clipId={clipId} />
    </div>
  );
}
