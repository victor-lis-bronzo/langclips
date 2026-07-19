import type { DifficultyType } from "#/infrastructure/repositories/preferences/preferences.repository.interface";
import { cn } from "#/lib/utils";
import { useEffect, useRef, useState } from "react";
import useGetClip from "../../hooks/use-get-clip";
import useSaveExercise from "../../hooks/use-save-exercise";
import useGetClipNext from "../../hooks/use-get-next-clip";
import { useNavigate } from "@tanstack/react-router";
import { evaluateAttempt } from "./functions/handle-attempt";
import { handleNextExercise as navigateToNext } from "./functions/handle-next-exercise";
import type { WordResult } from "./types/word-result";

type AnswerBoxProps = {
  variant: DifficultyType;
  deckId: string;
  clipId: string;
};

export default function AnswerBox({ variant, deckId, clipId }: AnswerBoxProps) {
  const [step, setStep] = useState<"writing" | "reveal">("writing");
  const [startTime] = useState<number>(Date.now());
  const [resultWords, setResultWords] = useState<WordResult[]>([]);

  const { data: nextClip } = useGetClipNext({ clipId });
  const navigate = useNavigate();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: clip } = useGetClip({ deckId, clipId });
  const { mutate: saveExercise } = useSaveExercise();

  useEffect(() => {
    if (step === "writing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  async function handleAttempt() {
    const input = inputRef.current;
    const value = input?.value;
    if (!input || !value) return;

    setStep("reveal");

    const { results, isHit } = evaluateAttempt(
      value,
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
    navigateToNext(nextClip, navigate);
  }

  async function handleSubmit() {
    if (step === "reveal") {
      handleNextExercise();
    } else {
      handleAttempt();
    }
  }

  return (
    <div className="max-w-1/3 w-full rounded-2xl border border-white min-h-full p-4 flex flex-col gap-2">
      <header className="my-2">
        <h3 className="font-caveat text-4xl font-bold text-white mb-2">
          Dictation
        </h3>
        <p className="text-muted-foreground font-inter text-sm">
          Type exactly what you hear in the video clip.
        </p>
      </header>
      <div className="flex flex-col flex-1 gap-2">
        {step === "writing" ? (
          <textarea
            ref={inputRef}
            className={cn(
              "w-full flex-1 bg-transparent outline-none resize-none border-l-2 border-white/50 my-4 px-4 font-inter text-base text-zinc-100 placeholder-zinc-500",
              "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-white/5",
            )}
            placeholder="Type your answer here..."
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, rgba(255, 255, 255, 0.38) 31px, rgba(255, 255, 255, 0.38) 32px)",
              backgroundSize: "100% 32px",
              backgroundAttachment: "local",
              lineHeight: "32px",
            }}
          />
        ) : (
          <div
            className={cn(
              "w-full flex-1 border-l-2 border-white/50 my-4 px-4 font-inter text-base",
              "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-white/5 overflow-y-auto",
            )}
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, rgba(255, 255, 255, 0.38) 31px, rgba(255, 255, 255, 0.38) 32px)",
              backgroundSize: "100% 32px",
              backgroundAttachment: "local",
              lineHeight: "32px",
            }}
          >
            <div className="flex flex-wrap gap-x-1">
              {resultWords.map((res, idx) => {
                if (res.status === "exact")
                  return (
                    <span key={idx} className="text-green-500">
                      {res.word}
                    </span>
                  );
                if (res.status === "case")
                  return (
                    <span key={idx} className="text-yellow-500">
                      {res.word}
                    </span>
                  );
                if (res.status === "missing")
                  return (
                    <span
                      key={idx}
                      className="text-red-500/70 underline decoration-red-500/50"
                    >
                      {res.word}
                    </span>
                  );
                return (
                  <span key={idx} className="text-red-500">
                    {res.word}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
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
