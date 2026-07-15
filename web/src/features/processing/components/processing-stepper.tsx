import { ProcessingStepCard } from "./processing-step-card";
import { ProcessingSuccessCard } from "./processing-success-card";
import type { Deck } from "../types/deck.types";
import { useNavigate } from "@tanstack/react-router";

interface ProcessingStepperProps {
  currentStep: string | null;
  status: string;
  result: Deck | null;
}

const PROCESS_STEPS = [
  { id: "download", label: "Download do vídeo original" },
  { id: "audio-extraction", label: "Extração de áudio" },
  { id: "transcription", label: "Transcrição do áudio" },
  { id: "clip-generation", label: "Geração dos cortes (clips)" },
  { id: "clip-upload", label: "Upload dos cortes gerados" },
  { id: "deck-construction", label: "Construção do deck" },
  { id: "deck-upload", label: "Salvando deck finalizado" },
  { id: "local-save", label: "Salvando offline no dispositivo" },
];

export function ProcessingStepper({
  currentStep,
  status,
  result,
}: ProcessingStepperProps) {
  const navigate = useNavigate();

  if (status === "saved" && result) {
    navigate({
      to: "/exercises/deck/$deckId/clip/$clipId",
      params: { deckId: result.id, clipId: result.clips?.[0]?.id },
    });
  }

  const getStepState = (
    stepId: string,
  ): "completed" | "processing" | "pending" => {
    if (status === "saved") return "completed";

    const currentIndex = PROCESS_STEPS.findIndex((s) => s.id === currentStep);
    const stepIndex = PROCESS_STEPS.findIndex((s) => s.id === stepId);

    if (currentIndex === -1) {
      // Se não há etapa ativa identificada e não terminou, assume a primeira etapa
      return stepIndex === 0 ? "processing" : "pending";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "processing";
    return "pending";
  };

  const activeIndex =
    status === "saved"
      ? PROCESS_STEPS.length
      : PROCESS_STEPS.findIndex((s) => s.id === currentStep);

  const resolvedActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  // Altura dinâmica: 1 card (80px) ou 2 cards + espaçamento (170px)
  const containerHeight = resolvedActiveIndex === 0 ? "80px" : "170px";

  // Deslocamento vertical: (índice_ativo - 1) * (altura + gap)
  const translateOffset =
    resolvedActiveIndex === 0 ? 0 : (resolvedActiveIndex - 1) * 90;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">
        Progresso das Etapas
      </h3>

      <div
        className="w-full overflow-hidden transition-all duration-500 ease-in-out relative rounded-2xl"
        style={{ height: containerHeight }}
      >
        <div
          className="flex flex-col gap-2.5 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${translateOffset}px)` }}
        >
          {PROCESS_STEPS.map((step, idx) => {
            const stepState = getStepState(step.id);
            return (
              <ProcessingStepCard
                key={step.id}
                step={step}
                idx={idx}
                stepState={stepState}
              />
            );
          })}

          {/* Card de Sucesso inserido ao final do track de rolagem */}
          {/* {status === "saved" && result && (
            <ProcessingSuccessCard result={result} />
          )} */}
        </div>
      </div>
    </div>
  );
}
export { PROCESS_STEPS };
