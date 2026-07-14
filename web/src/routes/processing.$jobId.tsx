import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useVideoProcessing } from "#/features/processing/hooks/use-video-processing";

export const Route = createFileRoute("/processing/$jobId")({
  component: ProcessingRoute,
});

function ProcessingRoute() {
  const { jobId } = Route.useParams();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4 md:p-8">
      <ProcessingScreen jobId={jobId} />
    </div>
  );
}

interface ProcessStep {
  id: string;
  label: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  { id: "download", label: "Download do vídeo original" },
  { id: "audio-extraction", label: "Extração de áudio" },
  { id: "transcription", label: "Transcrição do áudio" },
  { id: "clip-generation", label: "Geração dos cortes (clips)" },
  { id: "clip-upload", label: "Upload dos cortes gerados" },
  { id: "deck-construction", label: "Construção do deck" },
  { id: "deck-upload", label: "Salvando deck finalizado" },
];

export function ProcessingScreen({ jobId }: { jobId: string }) {
  const { progress, currentStep, status, result, error } = useVideoProcessing(jobId);

  useEffect(() => {
    if (status === "completed" && result) {
      console.log("Finalizado! Deck recebido:", result);
    }
  }, [status, result]);

  if (status === "failed") {
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

  const getStepState = (stepId: string): "completed" | "processing" | "pending" => {
    if (status === "completed") return "completed";

    const currentIndex = PROCESS_STEPS.findIndex((s) => s.id === currentStep);
    const stepIndex = PROCESS_STEPS.findIndex((s) => s.id === stepId);

    if (currentIndex === -1) {
      return stepIndex === 0 ? "processing" : "pending";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "processing";
    return "pending";
  };

  const activeStep = PROCESS_STEPS.find((s) => getStepState(s.id) === "processing");

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Card Superior Principal */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2 tracking-tight">
          {status === "completed" ? "Processamento Concluído!" : "Processando seu Vídeo"}
        </h2>
        
        <p className="text-zinc-400 text-sm text-center mb-6 max-w-sm">
          {status === "completed" 
            ? "O deck de estudos foi gerado e salvo com sucesso." 
            : activeStep 
              ? `Executando: ${activeStep.label}` 
              : "Iniciando a fila de processamento..."}
        </p>

        {/* Progresso Geral */}
        <div className="w-full mb-2">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-2">
            <span>Progresso Geral</span>
            <span className="font-semibold text-emerald-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-zinc-800/60 rounded-full overflow-hidden border border-zinc-700/30 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Etapas */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">
          Etapas do Processo
        </h3>
        
        <div className="flex flex-col gap-2.5">
          {PROCESS_STEPS.map((step, idx) => {
            const stepState = getStepState(step.id);
            
            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  stepState === "completed"
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300/90"
                    : stepState === "processing"
                    ? "bg-zinc-800/40 border-zinc-700 text-zinc-100 shadow-lg shadow-emerald-500/5 scale-[1.01]"
                    : "bg-zinc-900/10 border-zinc-800/40 text-zinc-500 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Indicador Visual do Estado */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-mono transition-all duration-300 ${
                    stepState === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                      : stepState === "processing"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse"
                      : "bg-zinc-950/40 border-zinc-800 text-zinc-600"
                  }`}>
                    {stepState === "completed" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium tracking-wide">
                      {step.label}
                    </span>
                    <span className={`text-[11px] mt-0.5 font-medium ${
                      stepState === "completed"
                        ? "text-emerald-500/70"
                        : stepState === "processing"
                        ? "text-emerald-400 animate-pulse"
                        : "text-zinc-600"
                    }`}>
                      {stepState === "completed" && "Concluída"}
                      {stepState === "processing" && "Pendente / Em andamento"}
                      {stepState === "pending" && "Aguardando"}
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
                    <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card do Deck quando finalizado */}
      {status === "completed" && result && (
        <div className="bg-zinc-900/60 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-emerald-400 font-bold text-lg">Deck Pronto!</h4>
              <p className="text-zinc-300 text-xs mt-1">ID do Deck: {result.id}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {result.clips.length} cortes gerados
            </span>
          </div>
          
          <div className="flex gap-3 mt-2">
            <Link
              to="/"
              className="flex-1 py-3 px-4 text-center text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-colors cursor-pointer border border-zinc-700"
            >
              Criar Novo Deck
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
