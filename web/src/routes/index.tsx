import { Header } from "#/components/header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Header.Root>
        <Header.Title>LangClips</Header.Title>
        <Header.Description>
          Crie clipes de idiomas a partir de vídeos
        </Header.Description>
      </Header.Root>
    </div>
  );
}
