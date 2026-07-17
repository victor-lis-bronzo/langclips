import { cn } from "#/lib/utils";
import type { DifficultyType } from "#/infrastructure/repositories/preferences/preferences.repository.interface";
import { useState } from "react";
import { LocalStorageRepository } from "#/infrastructure/repositories/preferences/preferences-local-storage.repository";
import { useNavigate } from "@tanstack/react-router";

const cards: Record<
  DifficultyType,
  {
    title: string;
    description: string;
    borderClassName: string;
    textColorClassName: string;
  }
> = {
  easy: {
    title: "Easy",
    description:
      "Ideal para iniciantes. Foco em vocabulário básico e estruturas simples.",
    textColorClassName: "text-green-500",
    borderClassName: "border-green-500/20 hover:border-green-500/60",
  },
  medium: {
    title: "Medium",
    description:
      "Ideal para intermediários. Foco em vocabulário intermediário e estruturas médias.",
    borderClassName: "border-yellow-500/20 hover:border-yellow-500/60",
    textColorClassName: "text-yellow-500",
  },
  hard: {
    title: "Hard",
    description:
      "Ideal para avançados. Foco em vocabulário avançado e estruturas complexas.",
    borderClassName: "border-red-500/20 hover:border-red-500/60",
    textColorClassName: "text-red-500",
  },
};

export default function DifficultySelectCards() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyType | undefined
  >(undefined);

  const navigate = useNavigate();

  async function handleConfirm() {
    const localStorageRepository = new LocalStorageRepository();
    await localStorageRepository.setDifficulty(selectedDifficulty!);
    navigate({
      to: "/",
    });
  }

  return (
    <main className="flex flex-col gap-2">
      <h1 className="text-emerald-400 text-2xl font-semibold mt-4">
        Selecione a Dificuldade
      </h1>
      <div className="flex flex-col gap-2">
        {(Object.keys(cards) as DifficultyType[]).map((difficulty) => {
          const card = cards[difficulty];
          return (
            <div
              key={difficulty}
              className={cn(
                "flex-1 w-full rounded-2xl transition-all duration-300 box-border shrink-0 bg-zinc-800/40 border-2 text-zinc-100 shadow-lg cursor-pointer",
                card.borderClassName,
                selectedDifficulty === difficulty
                  ? "border-2 border-emerald-500"
                  : "",
              )}
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              <div className="flex flex-col gap-2 p-4">
                <h2 className={cn("text-lg font-bold", card.textColorClassName)}>
                  {card.title}
                </h2>
                <p>{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        className={cn(
          "ml-auto rounded-2xl transition-all duration-300 box-border border-2 text-zinc-100 shadow-lg cursor-pointer mt-4 py-2 px-12 text-lg font-bold",
          !selectedDifficulty ? "opacity-50 cursor-not-allowed" : "",
          selectedDifficulty
            ? "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500"
            : "bg-zinc-800/40 border-zinc-700",
        )}
        disabled={!selectedDifficulty}
        onClick={handleConfirm}
      >
        Confirmar
      </button>
    </main>
  );
}
