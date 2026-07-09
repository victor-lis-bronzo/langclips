import { Container } from "#/components/container";
import { DropFileForm } from "#/features/home/components/upload-file-form";
import { Header } from "#/modules/header";
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
        <DropFileForm />
      </Container>
    </div>
  );
}
