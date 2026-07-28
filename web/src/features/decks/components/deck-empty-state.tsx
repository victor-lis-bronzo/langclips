import { Link } from "@tanstack/react-router";
import { Film, Plus } from "lucide-react";

export function DeckEmptyState() {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-zinc-900/40 border border-white/10 max-w-md mx-auto my-12 backdrop-blur-sm">
			<div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
				<Film className="w-8 h-8" />
			</div>
			<h2 className="text-2xl font-bold text-white mb-2">No Decks Found</h2>
			<p className="text-sm text-zinc-400 mb-6">
				You haven't processed any video clips yet. Upload a video to start
				learning!
			</p>
			<Link
				to="/"
				className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
			>
				<Plus className="w-5 h-5" />
				<span>Create First Deck</span>
			</Link>
		</div>
	);
}
