import { cn } from "#/lib/utils";
import { splitIntoWords } from "#/lib/string-utils";
import { useEffect, useState, useMemo, useRef } from "react";

type AnswerMediumProps = {
	transcription: string;
	onChange: (val: string) => void;
	disabled: boolean;
};

type TokenConfig = {
	index: number;
	originalWord: string;
	isVisible: boolean;
};

export default function AnswerMedium({
	transcription,
	onChange,
	disabled,
}: AnswerMediumProps) {
	const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

	const tokens = useMemo(() => {
		const words = splitIntoWords(transcription);
		const count = words.length;
		if (count === 0) return [];

		// Aim for ~35% visible words (less than half)
		const targetVisible = Math.max(1, Math.floor(count * 0.35));

		// Pick deterministic or random indices to show
		// For consistency per transcription, we can seed or pick evenly spaced indices
		const visibleIndices = new Set<number>();
		if (count === 1) {
			// If 1 word, hide it
		} else {
			const step = count / targetVisible;
			for (let i = 0; i < targetVisible; i++) {
				const idx = Math.min(count - 1, Math.floor(i * step + step / 2));
				visibleIndices.add(idx);
			}
		}

		return words.map((word, index) => ({
			index,
			originalWord: word,
			isVisible: visibleIndices.has(index),
		})) as TokenConfig[];
	}, [transcription]);

	const [userInputs, setUserInputs] = useState<Record<number, string>>({});

	useEffect(() => {
		setUserInputs({});
		// Focus first input field
		const firstInput = inputsRef.current.find((el) => el !== null);
		if (firstInput && !disabled) {
			firstInput.focus();
		}
	}, [disabled]);

	const handleInputChange = (index: number, val: string) => {
		const updatedInputs = { ...userInputs, [index]: val };
		setUserInputs(updatedInputs);

		// Build complete string
		const fullPhrase = tokens
			.map((tok) =>
				tok.isVisible ? tok.originalWord : updatedInputs[tok.index] || "",
			)
			.join(" ");

		onChange(fullPhrase);
	};

	return (
		<div className="flex flex-col flex-1 gap-4 my-4">
			<div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase select-none">
				Fill in the missing words:
			</div>
			<div
				className={cn(
					"w-full min-h-[140px] p-4 rounded-xl border border-white/20 bg-zinc-900/40 flex flex-wrap items-center gap-x-2 gap-y-3 font-inter text-base text-zinc-100 leading-relaxed",
					disabled && "opacity-60 cursor-not-allowed",
				)}
			>
				{tokens.map((token, idx) => {
					if (token.isVisible) {
						return (
							<span
								key={token.index}
								className="font-semibold text-zinc-300 py-1"
							>
								{token.originalWord}
							</span>
						);
					}

					const currentVal = userInputs[token.index] || "";
					const inputWidthCh = Math.max(token.originalWord.length + 1, 4);

					return (
						<input
							key={token.index}
							ref={(el) => (inputsRef.current[idx] = el)}
							type="text"
							disabled={disabled}
							value={currentVal}
							onChange={(e) => handleInputChange(token.index, e.target.value)}
							placeholder="..."
							style={{ width: `${inputWidthCh}ch` }}
							className={cn(
								"px-2 py-1 bg-zinc-800/80 border-b-2 border-primary/60 focus:border-primary outline-none text-zinc-100 text-center font-medium rounded-t transition-all",
								disabled &&
									"bg-transparent border-zinc-600 text-zinc-400 cursor-not-allowed",
							)}
						/>
					);
				})}
			</div>
		</div>
	);
}
