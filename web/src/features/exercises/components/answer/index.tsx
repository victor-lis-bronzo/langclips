import type { DifficultyType } from "#/infrastructure/repositories/preferences/preferences.repository.interface";
import { cn } from "#/lib/utils";
import { useState } from "react";
import useGetClip from "../../hooks/use-get-clip";
import useSaveExercise from "../../hooks/use-save-exercise";
import useGetClipNext from "../../hooks/use-get-next-clip";
import { useNavigate } from "@tanstack/react-router";
import { evaluateAttempt } from "./functions/handle-attempt";
import { handleNextExercise as navigateToNext } from "./functions/handle-next-exercise";
import type { WordResult } from "./types/word-result";

import AnswerEasy from "./variants/answer-easy";
import AnswerMedium from "./variants/answer-medium";
import AnswerHard from "./variants/answer-hard";

type AnswerBoxProps = {
	variant: DifficultyType;
	deckId: string;
	clipId: string;
};

export default function AnswerBox({ variant, deckId, clipId }: AnswerBoxProps) {
	const [step, setStep] = useState<"writing" | "reveal">("writing");
	const [startTime] = useState<number>(Date.now());
	const [currentAnswer, setCurrentAnswer] = useState<string>("");
	const [resultWords, setResultWords] = useState<WordResult[]>([]);

	const { data: nextClip } = useGetClipNext({ deckId, clipId });
	const navigate = useNavigate();

	const { data: clip } = useGetClip({ deckId, clipId });
	const { mutate: saveExercise } = useSaveExercise();

	async function handleAttempt() {
		if (!currentAnswer.trim()) return;

		setStep("reveal");

		const { results, isHit } = evaluateAttempt(
			currentAnswer,
			clip?.transcription || "",
		);
		setResultWords(results);

		const timeSpentMs = Date.now() - startTime;

		saveExercise({
			id: crypto.randomUUID(),
			deckId,
			clipId,
			difficulty: variant,
			status: isHit ? "CORRECT" : "WRONG",
			timeSpentMs,
			createdAt: startTime,
			doneAt: Date.now(),
		});
	}

	async function handleNextExercise() {
		setStep("writing");
		setResultWords([]);
		setCurrentAnswer("");

		if (nextClip) {
			navigateToNext(nextClip, navigate);
		} else {
			navigate({ to: `/results/$deckId`, params: { deckId } });
		}
	}

	async function handleSubmit() {
		if (step === "reveal") {
			handleNextExercise();
		} else {
			handleAttempt();
		}
	}

	return (
		<div className="lg:max-w-1/3 w-full rounded-2xl border border-white min-h-full p-4 flex flex-col gap-2">
			<header className="my-2">
				<h3 className="font-caveat text-4xl font-bold text-white mb-2">
					Dictation
				</h3>
				<p className="text-muted-foreground font-inter text-sm">
					{variant === "easy" &&
						"Click on the words below to form the sentence you hear."}
					{variant === "medium" &&
						"Fill in the missing words in the sentence you hear."}
					{variant === "hard" &&
						"Type exactly what you hear in the video clip."}
				</p>
			</header>
			<div className="flex flex-col flex-1 gap-2">
				{variant === "easy" && (
					<AnswerEasy
						transcription={clip?.transcription || ""}
						onChange={setCurrentAnswer}
						disabled={step === "reveal"}
					/>
				)}
				{variant === "medium" && (
					<AnswerMedium
						transcription={clip?.transcription || ""}
						onChange={setCurrentAnswer}
						disabled={step === "reveal"}
					/>
				)}
				{variant === "hard" && (
					<AnswerHard
						value={currentAnswer}
						onChange={setCurrentAnswer}
						disabled={step === "reveal"}
					/>
				)}

				{step === "reveal" && (
					<div className="flex flex-col gap-2 border-t border-white/10 pt-4 mt-2 max-h-[160px]">
						<span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
							Comparison / Correct Answer
						</span>
						<div
							className={cn(
								"w-full flex-1 border-l-2 border-primary/50 px-4 py-2 font-inter text-base overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-white/5",
							)}
							style={{
								backgroundImage:
									"repeating-linear-gradient(transparent, transparent 31px, rgba(255, 255, 255, 0.2) 31px, rgba(255, 255, 255, 0.2) 32px)",
								backgroundSize: "100% 32px",
								backgroundAttachment: "local",
								lineHeight: "32px",
							}}
						>
							<div className="flex flex-wrap gap-x-1">
								{resultWords.map((res, idx) => {
									const key = `${idx}-${res.word}`;
									if (res.status === "exact")
										return (
											<span key={key} className="text-green-500">
												{res.word}
											</span>
										);
									if (res.status === "case")
										return (
											<span key={key} className="text-yellow-500">
												{res.word}
											</span>
										);
									if (res.status === "missing")
										return (
											<span
												key={key}
												className="text-red-500/70 underline decoration-red-500/50"
											>
												{res.word}
											</span>
										);
									return (
										<span key={key} className="text-red-500">
											{res.word}
										</span>
									);
								})}
							</div>
						</div>
					</div>
				)}
				<button
					type="button"
					onClick={handleSubmit}
					disabled={step === "writing" && !currentAnswer.trim()}
					className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-md bg-primary/25 hover:bg-primary/40 active:scale-98 transition-all duration-200 text-zinc-200 hover:text-white cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="text-sm font-caveat font-bold uppercase">
						{step === "reveal" ? "Next" : "Check answer"}
					</span>
				</button>
			</div>
		</div>
	);
}
