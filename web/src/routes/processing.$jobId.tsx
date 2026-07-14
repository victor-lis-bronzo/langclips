import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useVideoProcessing } from "#/features/processing/hooks/use-video-processing";

export const Route = createFileRoute("/processing/$jobId")({
	component: ProcessingRoute,
});

function ProcessingRoute() {
	const { jobId } = Route.useParams();
	return (
		<div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
			<ProcessingScreen jobId={jobId} />
		</div>
	);
}

export function ProcessingScreen({ jobId }: { jobId: string }) {
	const { progress, status, result, error } = useVideoProcessing(jobId);

	useEffect(() => {
		if (status === "completed" && result) {
			console.log("Finalizado! Deck recebido:", result);
		}
	}, [status, result]);

	if (status === "failed") {
		return (
			<div className="p-4 border-2 border-red-500 rounded-xl bg-red-50 text-red-900">
				<h3 className="font-bold">O processamento falhou.</h3>
				<p className="text-sm">{error || "Motivo desconhecido"}</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-700 rounded-2xl w-full max-w-md mx-auto">
			<h2 className="text-xl font-semibold text-zinc-100 mb-4">
				{progress < 100 ? "Extraindo áudio e fatiando..." : "Finalizando..."}
			</h2>

			<div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
				<div
					className="h-full bg-emerald-500 transition-all duration-300 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>

			<span className="mt-2 text-sm text-zinc-400 font-mono">
				{Math.round(progress)}%
			</span>

			<div className="mt-8 w-full animate-pulse flex flex-col gap-3">
				<div className="h-10 bg-zinc-800/50 rounded-lg w-full"></div>
				<div className="h-10 bg-zinc-800/50 rounded-lg w-3/4"></div>
			</div>
		</div>
	);
}
