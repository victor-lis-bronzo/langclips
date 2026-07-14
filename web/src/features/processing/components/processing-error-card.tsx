import { Link } from "@tanstack/react-router";

interface ProcessingErrorCardProps {
  error: string | null;
}

export function ProcessingErrorCard({ error }: ProcessingErrorCardProps) {
  return (
    <div className="p-6 border-2 border-red-500/30 rounded-2xl bg-red-950/20 text-red-200 max-w-md w-full mx-auto shadow-xl backdrop-blur-sm">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        O processamento falhou
      </h3>
      <p className="text-sm text-red-300/80 mb-4">{error || "Motivo desconhecido"}</p>
      <Link
        to="/"
        className="inline-block w-full py-2.5 px-4 text-center text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}
