import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/difficulty")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4 md:p-8">
      Hello "/difficulty"!
    </div>
  );
}
