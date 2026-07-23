import { cn } from "#/lib/utils";
import { splitIntoWords } from "#/lib/string-utils";
import { useEffect, useState, useMemo } from "react";

type AnswerEasyProps = {
	transcription: string;
	onChange: (val: string) => void;
	disabled: boolean;
};

type WordItem = {
	id: string;
	word: string;
};

function shuffleArray<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export default function AnswerEasy({
	transcription,
	onChange,
	disabled,
}: AnswerEasyProps) {
	const initialTokens = useMemo(() => {
		return splitIntoWords(transcription).map((word, idx) => ({
			id: `${idx}-${word}`,
			word,
		}));
	}, [transcription]);

	const [availableWords, setAvailableWords] = useState<WordItem[]>([]);
	const [selectedWords, setSelectedWords] = useState<WordItem[]>([]);

	useEffect(() => {
		setAvailableWords(shuffleArray(initialTokens));
		setSelectedWords([]);
	}, [initialTokens]);

	const handleSelectWord = (item: WordItem) => {
		if (disabled) return;
		const nextSelected = [...selectedWords, item];
		const nextAvailable = availableWords.filter((w) => w.id !== item.id);

		setSelectedWords(nextSelected);
		setAvailableWords(nextAvailable);
		onChange(nextSelected.map((w) => w.word).join(" "));
	};

	const handleDeselectWord = (item: WordItem) => {
		if (disabled) return;
		const nextSelected = selectedWords.filter((w) => w.id !== item.id);
		const nextAvailable = [...availableWords, item];

		setSelectedWords(nextSelected);
		setAvailableWords(nextAvailable);
		onChange(nextSelected.map((w) => w.word).join(" "));
	};

	const handleReset = () => {
		if (disabled) return;
		setSelectedWords([]);
		setAvailableWords(shuffleArray(initialTokens));
		onChange("");
	};

	return (
		<div className="flex flex-col flex-1 gap-4 my-4">
			{/* Selected Words / Sentence Construction Box */}
			<div
				className={cn(
					"w-full min-h-[120px] p-4 rounded-xl border border-white/20 bg-zinc-900/40 flex flex-wrap content-start gap-2 transition-all duration-200",
					disabled && "opacity-60 cursor-not-allowed",
				)}
			>
				{selectedWords.length === 0 ? (
					<span className="text-zinc-500 font-inter text-sm italic select-none">
						Click on words from the bank below to construct the phrase...
					</span>
				) : (
					selectedWords.map((item) => (
						<button
							key={item.id}
							type="button"
							disabled={disabled}
							onClick={() => handleDeselectWord(item)}
							className={cn(
								"px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-zinc-100 font-inter text-sm font-medium hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-200 transition-all duration-150 cursor-pointer active:scale-95 shadow-sm",
								disabled &&
									"cursor-not-allowed hover:bg-primary/20 hover:border-primary/40 hover:text-zinc-100",
							)}
						>
							{item.word}
						</button>
					))
				)}
			</div>

			{/* Action buttons (Clear) */}
			{selectedWords.length > 0 && !disabled && (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleReset}
						className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
					>
						Clear selection
					</button>
				</div>
			)}

			{/* Available Word Bank */}
			<div className="flex flex-col gap-2">
				<span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase select-none">
					Word Bank
				</span>
				<div className="flex flex-wrap gap-2 min-h-[80px] p-3 rounded-xl border border-white/10 bg-zinc-950/40">
					{availableWords.map((item) => (
						<button
							key={item.id}
							type="button"
							disabled={disabled}
							onClick={() => handleSelectWord(item)}
							className={cn(
								"px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 font-inter text-sm font-medium hover:bg-primary/30 hover:border-primary/50 hover:text-white transition-all duration-150 cursor-pointer active:scale-95 shadow-sm",
								disabled &&
									"cursor-not-allowed hover:bg-zinc-800/80 hover:border-zinc-700/60 hover:text-zinc-200 opacity-50",
							)}
						>
							{item.word}
						</button>
					))}
					{availableWords.length === 0 && selectedWords.length > 0 && (
						<span className="text-zinc-600 font-inter text-xs italic select-none">
							All words placed!
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
