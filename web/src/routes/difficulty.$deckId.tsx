import ClipsGeneralInfo from "#/features/difficulty/components/clips-general-info";
import DifficultySelectCards from "#/features/difficulty/components/difficulty-select-cards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/difficulty/$deckId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { deckId } = Route.useParams();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4 md:p-8">
      <div className="flex flex-col w-full md:max-w-1/2 lg:max-w-1/3 gap-2">
        <ClipsGeneralInfo deckId={deckId} />
        <DifficultySelectCards />
      </div>
    </div>
  );
}
