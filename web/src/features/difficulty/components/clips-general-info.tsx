import { useEffect, useState } from "react";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import type { DeckRecord } from "#/infrastructure/database/indexed-db.types";

type ClipsGeneralInfoProps = {
  deckId: string;
};

export default function ClipsGeneralInfo({ deckId }: ClipsGeneralInfoProps) {
  const [deck, setDeck] = useState<DeckRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storageRepository = new IndexedDbStorageRepository();
    storageRepository.getDeck(deckId).then((data) => {
      setDeck(data);
      setLoading(false);
    });
  }, [deckId]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-between p-4 h-20 rounded-2xl transition-all duration-300 box-border shrink-0 bg-zinc-800/40 border-zinc-700 border-2 text-zinc-100 shadow-lg animate-pulse" />
    );
  }

  const clipsCount = deck?.clips.length ?? 0;

  const totalSeconds = deck?.totalSeconds ?? 0;
  const roundedSeconds = Math.round(totalSeconds);
  const minutes = String(Math.floor(roundedSeconds / 60)).padStart(2, "0");
  const seconds = String(roundedSeconds % 60).padStart(2, "0");

  const durationText =
    roundedSeconds < 60 ? `~${roundedSeconds} seg` : `~${minutes}m ${seconds}s`;

  return (
    <div className="w-full flex items-center justify-between p-4 h-20 rounded-2xl transition-all duration-300 box-border shrink-0 bg-zinc-800/40 border-zinc-700 border-2 text-zinc-100 shadow-lg">
      <div className="flex flex-col">
        <h3 className="font-inter text-emerald-400 text-xs uppercase">
          Clipes Gerados
        </h3>
        <h1 className="text-xl font-semibold">
          {clipsCount}{" "}
          {clipsCount === 1 ? "clip foi gerado" : "clips foram gerados"}
        </h1>
      </div>
      <div className="flex flex-col ml-auto text-right">
        <h3 className="font-inter text-emerald-400 text-xs uppercase">
          Tempo Total
        </h3>
        <h1 className="text-xl font-semibold">{durationText}</h1>
      </div>
    </div>
  );
}
