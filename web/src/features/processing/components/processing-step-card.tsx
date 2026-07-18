export interface ProcessStep {
	id: string;
	label: string;
}

interface ProcessingStepCardProps {
	step: ProcessStep;
	idx: number;
	stepState: "completed" | "processing" | "pending";
}

export function ProcessingStepCard({
	step,
	idx,
	stepState,
}: ProcessingStepCardProps) {
	return (
		<div
			className={`flex items-center justify-between p-4 h-20 rounded-2xl border transition-all duration-300 box-border shrink-0 ${
				stepState === "completed"
					? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300/90"
					: stepState === "processing"
						? "bg-zinc-800/40 border-zinc-700 text-zinc-100 shadow-lg shadow-emerald-500/5 scale-[1.01]"
						: "bg-zinc-900/10 border-zinc-800/40 text-zinc-500 opacity-50"
			}`}
		>
			<div className="flex items-center gap-3.5">
				{/* Indicador Visual do Estado */}
				<div
					className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-mono transition-all duration-300 ${
						stepState === "completed"
							? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
							: stepState === "processing"
								? "bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse"
								: "bg-zinc-950/40 border-zinc-800 text-zinc-600"
					}`}
				>
					{stepState === "completed" ? (
						<svg
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={3}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					) : (
						idx + 1
					)}
				</div>

				<div className="flex flex-col">
					<span className="text-sm font-medium tracking-wide">
						{step.label}
					</span>
					<span
						className={`text-[11px] mt-0.5 font-medium font-mono ${
							stepState === "completed"
								? "text-emerald-500/70"
								: stepState === "processing"
									? "text-emerald-400 animate-pulse"
									: "text-zinc-600"
						}`}
					>
						{stepState === "completed" && "Concluída"}
						{stepState === "processing" && "Processando agora..."}
						{stepState === "pending" && "Pendente"}
					</span>
				</div>
			</div>

			{/* Ícone de status na direita */}
			<div>
				{stepState === "completed" && (
					<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
						Feito
					</span>
				)}
				{stepState === "processing" && (
					<div className="relative flex h-2 w-2 mr-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
					</div>
				)}
				{stepState === "pending" && (
					<svg
						className="w-4 h-4 text-zinc-700"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				)}
			</div>
		</div>
	);
}
