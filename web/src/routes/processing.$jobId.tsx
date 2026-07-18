import { createFileRoute } from "@tanstack/react-router";
import { ProcessingErrorCard } from "#/features/processing/components/processing-error-card";
import { ProcessingHeader } from "#/features/processing/components/processing-header";
import {
	PROCESS_STEPS,
	ProcessingStepper,
} from "#/features/processing/components/processing-stepper";
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

export function ProcessingScreen({ jobId }: { jobId: string }) {
	const { progress, currentStep, status, result, error } =
		useVideoProcessing(jobId);

	if (status === "failed" || status === "download-failed") {
		return <ProcessingErrorCard error={error} />;
	}

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
				result={result?.deck ?? null}
			/>
		</div>
	);
}
