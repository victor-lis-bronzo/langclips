import PrecisionCircle from "#/features/results/components/precision-circle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/results/$deckId")({
  component: ResultsRoute,
});

function ResultsRoute() {
  const { deckId } = Route.useParams();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4 md:p-8">
      <ResultsScreen deckId={deckId} />
    </div>
  );
}

function ResultsScreen({ deckId }: { deckId: string }) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <PrecisionCircle deckId={deckId} />
    </div>
  );
}
