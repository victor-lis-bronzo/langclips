interface ProcessingHeaderProps {
	status: string;
	progress: number;
	currentStepLabel: string | null;
}

export function ProcessingHeader({
	status,
	progress,
	currentStepLabel,
}: ProcessingHeaderProps) {
	const isFinished = status === "completed" || status === "saved";

	return (
		<div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
			<h2 className="text-2xl font-bold text-zinc-100 mb-2 tracking-tight">
				{isFinished ? "Processing Completed!" : "Processing your Video"}
			</h2>

			<p className="text-zinc-400 text-sm text-center mb-6 max-w-sm h-5 overflow-hidden text-ellipsis whitespace-nowrap">
				{isFinished
					? "The study deck was successfully generated and saved to your device."
					: status === "downloading"
						? "Saving files locally for offline use..."
						: currentStepLabel
							? `Executing: ${currentStepLabel}`
							: "Starting processing queue..."}
			</p>

			{/* Progresso Geral */}
			<div className="w-full mb-2">
				<div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-2">
					<span>Overall Progress</span>
					<span className="font-semibold text-emerald-400">
						{Math.round(progress)}%
					</span>
				</div>
				<div className="w-full h-3 bg-zinc-800/60 rounded-full overflow-hidden border border-zinc-700/30 p-0.5">
					<div
						className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
