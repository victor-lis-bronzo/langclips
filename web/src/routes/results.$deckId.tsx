import PrecisionCircle from "#/features/results/components/precision-circle";
import PerformanceSummary from "#/features/results/components/performance-summary";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownLeft, CornerDownLeft } from "lucide-react";

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
		<div className="w-full max-w-4xl mx-auto flex flex-col">
			<div className="flex w-full mx-auto flex-col md:flex-row md:justify-center items-stretch gap-6">
				<PrecisionCircle deckId={deckId} />
				<PerformanceSummary deckId={deckId} />
			</div>
			<Link to="/" className="mx-auto">
				<div className="mt-8 py-2 px-4 mx-auto bg-card border border-white/10 rounded-[20px] cursor-pointer flex items-center gap-2 hover:scale-105 transition-all duration-300">
					<CornerDownLeft />
					<span className="font-caveat text-[20px] font-bold text-white leading-none">
						Back to Home
					</span>
				</div>
			</Link>
		</div>
	);
}
