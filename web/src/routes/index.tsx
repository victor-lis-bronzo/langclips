import { createFileRoute } from "@tanstack/react-router";
import { Container } from "#/components/container";
import { DropFileForm } from "#/features/home/components/upload-file-form";
import { Header } from "#/modules/header";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
			<Container>
				<Header.Root className="lg:max-w-2/3">
					<Header.Title>LangClips</Header.Title>
					<Header.Description>
						É uma plataforma interativa de aprendizado que foca em aprender
						Inglês.
					</Header.Description>
					<Header.Description className="max-md:hidden">
						Você faz o upload do seu trecho de série, filme, anime ou qualquer
						vídeo que você queira aprender a traduzir e analisar.
					</Header.Description>
				</Header.Root>
				<DropFileForm />
			</Container>
		</div>
	);
}
