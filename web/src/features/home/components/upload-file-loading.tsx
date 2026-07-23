import { Upload } from "lucide-react";

export function UploadFileLoading() {
	return (
		<div className="flex-1 flex flex-col items-center justify-center min-h-[450px] my-4 rounded-xl border border-dashed border-zinc-800/40 bg-zinc-950/10">
			<div className="w-full max-w-md p-6 rounded-2xl border bg-zinc-800/40 border-zinc-700 text-zinc-100 shadow-lg shadow-emerald-500/5 scale-[1.01] transition-all duration-300">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3.5">
						{/* Indicador Visual do Estado */}
						<div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse">
							<Upload size={18} className="animate-bounce" />
						</div>

						<div className="flex flex-col">
							<span className="text-sm font-medium tracking-wide">
								Uploading video to the cloud
							</span>
							<span className="text-[11px] mt-0.5 font-medium font-mono text-emerald-400 animate-pulse">
								Please wait, it may take a few seconds...
							</span>
						</div>
					</div>

					{/* Ícone de status na direita */}
					<div className="relative flex h-2.5 w-2.5 mr-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
					</div>
				</div>

				{/* Barra de progresso indeterminada */}
				<div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden mt-5 relative">
					<div className="h-full bg-emerald-500 rounded-full animate-shimmer-progress w-1/2" />
				</div>
			</div>
		</div>
	);
}
