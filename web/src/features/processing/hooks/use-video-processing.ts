import { useEffect, useState } from "react";
import type { Deck } from "../types/deck.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

type JobStatus = "idle" | "processing" | "completed" | "failed";

export function useVideoProcessing(jobId: string | null) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [result, setResult] = useState<{ success: boolean; deck: Deck } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    setStatus("processing");

    const eventSource = new EventSource(
      `${API_BASE_URL}/videos/events/${jobId}`,
    );

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.status === "processing") {
        if (typeof payload.progress === "object" && payload.progress !== null) {
          setProgress(payload.progress.percentage ?? 0);
          setCurrentStep(payload.progress.step ?? null);
        } else {
          setProgress(payload.progress ?? 0);
        }
      }

      if (payload.status === "completed") {
        setStatus("completed");
        setResult(payload.result);
        setProgress(100);
        setCurrentStep(null);
        eventSource.close();
      }

      if (payload.status === "failed") {
        setStatus("failed");
        setError(payload.error);
        setCurrentStep(null);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("Falha de conexão no SSE:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  return { progress, currentStep, status, result, error };
}
