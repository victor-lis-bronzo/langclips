import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Container } from "#/components/container";
import { DeckCard } from "#/features/decks/components/deck-card";
import { DeckCardSkeleton } from "#/features/decks/components/deck-card-skeleton";
import { DeckEmptyState } from "#/features/decks/components/deck-empty-state";
import { useGetAllDecks } from "#/features/decks/hooks/use-get-all-decks";

export const Route = createFileRoute("/decks")({
	component: DecksRouteScreen,
});

function DecksRouteScreen() {
	const { data: decks, isLoading } = useGetAllDecks();

	return (
		<div className="flex flex-col min-h-screen relative overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-white">
			<div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

			<Container className="flex-1 flex flex-col relative z-10 py-8 max-w-6xl mx-auto">
				{/* Header */}
				<header className="flex items-center justify-between py-6 mb-8 border-b border-white/10">
					<div className="flex items-center gap-3">
						<div>
							<h1 className="text-3xl font-extrabold text-white tracking-tight">
								My Decks
							</h1>
							<p className="text-xs text-zinc-400 font-mono mt-0.5">
								Select a deck to start practicing your clips
							</p>
						</div>
					</div>

					<Link
						to="/"
						className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-white font-semibold text-sm transition-all duration-300 hover:scale-105 cursor-pointer"
					>
						<Plus className="w-4 h-4" />
						<span>New Deck</span>
					</Link>
				</header>

				<main className="flex-1">
					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							<DeckCardSkeleton />
							<DeckCardSkeleton />
							<DeckCardSkeleton />
						</div>
					) : !decks || decks.length === 0 ? (
						<DeckEmptyState />
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{decks.map((deck) => (
								<DeckCard key={deck.id} deck={deck} />
							))}
						</div>
					)}
				</main>
			</Container>
		</div>
	);
}
