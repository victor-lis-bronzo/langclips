import { Container } from "#/components/container";
import { DropFile } from "#/components/drop-file";
import { Header } from "#/components/header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Container>
        <Header.Root>
          <Header.Title>LangClips</Header.Title>
          <Header.Description>
            O LangClips é uma plataforma interativa de aprendizado de inglês
            baseada em vídeos curtos.
          </Header.Description>
        </Header.Root>
        <DropFile title="Pronto para praticar?" />
      </Container>
    </div>
  );
}
