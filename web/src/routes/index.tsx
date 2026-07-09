import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <h1 className="font-['Caveat'] font-bold tracking-tight text-[48px] leading-tight text-white">
        LangClips
      </h1>
    </div>
  );
}
