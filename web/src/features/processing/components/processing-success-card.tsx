import { Link } from "@tanstack/react-router";
import type { Deck } from "../types/deck.types";

interface ProcessingSuccessCardProps {
  result: Deck;
}

export function ProcessingSuccessCard({ result }: ProcessingSuccessCardProps) {
  return (
    <div className="bg-zinc-900/60 border border-emerald-500/30 rounded-2xl p-4 h-20 flex items-center justify-between shadow-2xl backdrop-blur-md animate-fade-in box-border shrink-0">
      <div className="flex flex-col">
        <h4 className="text-emerald-400 font-bold text-sm tracking-wide">Deck Pronto!</h4>
        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-300/80 mt-0.5">
          {result.clips.length} cortes gerados
        </span>
      </div>
      
      <Link
        to="/"
        className="py-2 px-3 text-center text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
      >
        Novo Deck
      </Link>
    </div>
  );
}
