import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/exercises/deck/$deckId/clip/$clipId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { deckId, clipId } = Route.useParams();
  return <div>Hello {`"/exercises/deck/${deckId}/clip/${clipId}"`}!</div>;
}
