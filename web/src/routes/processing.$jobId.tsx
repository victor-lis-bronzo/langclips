import { createFileRoute } from "@tanstack/react-router";
import { useVideoProcessing } from "#/features/processing/hooks/use-video-processing";
import { ProcessingHeader } from "#/features/processing/components/processing-header";
import { ProcessingStepper, PROCESS_STEPS } from "#/features/processing/components/processing-stepper";
import { ProcessingErrorCard } from "#/features/processing/components/processing-error-card";

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

export function ProcessingScreen({ jobId }: { jobId: string }) {
  const { progress, currentStep, status, result, error } = useVideoProcessing(jobId);

  if (status === "failed") {
    return <ProcessingErrorCard error={error} />;
  }

  // Obter label do passo atual para subtítulo dinâmico no cabeçalho
  const activeStep = PROCESS_STEPS.find((s) => s.id === currentStep);
  const currentStepLabel = activeStep ? activeStep.label : null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <ProcessingHeader
        status={status}
        progress={progress}
        currentStepLabel={currentStepLabel}
      />

      <ProcessingStepper
        currentStep={currentStep}
        status={status}
        result={result}
      />
    </div>
  );
}
