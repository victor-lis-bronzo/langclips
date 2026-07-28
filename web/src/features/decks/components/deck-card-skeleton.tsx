export function DeckCardSkeleton() {
	return (
		<div className="flex flex-col rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-lg animate-pulse h-[260px]">
			<div className="w-full h-40 bg-zinc-800/80" />
			<div className="p-4 flex flex-col justify-between flex-1 gap-2">
				<div className="h-4 w-1/3 bg-zinc-800 rounded" />
				<div className="flex justify-between items-center mt-2">
					<div className="h-5 w-20 bg-zinc-800 rounded" />
					<div className="h-5 w-20 bg-zinc-800 rounded" />
				</div>
			</div>
		</div>
	);
}
