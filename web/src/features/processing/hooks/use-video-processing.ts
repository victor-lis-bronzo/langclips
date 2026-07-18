import { useEffect, useState } from "react";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { DeckDownloadService } from "../services/deck-download.service";
import type { Clip, Deck } from "../types/deck.types";
import { useAcknowledgeDownload } from "./use-acknowledge-download";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export type JobStatus =
	| "idle"
	| "processing"
	| "completed"
	| "downloading"
	| "saved"
	| "download-failed"
	| "failed";

const downloadService = new DeckDownloadService();
const storageRepository = new IndexedDbStorageRepository();

export function useVideoProcessing(jobId: string | null) {
	const [progress, setProgress] = useState(0);
	const [currentStep, setCurrentStep] = useState<string | null>(null);
	const [status, setStatus] = useState<JobStatus>("idle");
	const [result, setResult] = useState<{ success: boolean; deck: Deck } | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const { acknowledge } = useAcknowledgeDownload();

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
				const deck = payload.result?.deck;
				if (!deck) {
					setStatus("failed");
					setError("Deck não recebido no payload de conclusão.");
					eventSource.close();
					return;
				}

				setResult(payload.result);
				setProgress(100);
				setCurrentStep("local-save");
				setStatus("downloading");
				eventSource.close();

				// Executar o download dos assets e salvamento no IndexedDB localmente
				(async () => {
					try {
						// 1. Baixar os vídeos (clips) e montar registros do banco
						const { deckRecord, clipRecords } =
							await downloadService.downloadDeckAssets(deck);

						// 2. Salvar no IndexedDB
						await storageRepository.cleanUp();
						await storageRepository.saveDeck(deckRecord);
						for (const clipRecord of clipRecords) {
							await storageRepository.saveClip(clipRecord);
						}

						// 3. Notificar a API para exclusão no R2
						const fileKeys = [
							deck.sourceFileKey,
							...deck.clips.map((c: Clip) => c.sourceFileKey),
						];
						await acknowledge(fileKeys);

						// 4. Transição de estado para concluído localmente (offline-ready)
						setStatus("saved");
						setCurrentStep(null);
					} catch (err) {
						console.error("Erro na persistência local do deck:", err);
						setStatus("download-failed");
						setError(
							err instanceof Error
								? err.message
								: "Falha ao salvar o deck localmente.",
						);
						setCurrentStep(null);
						eventSource.close();
					}
				})();
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
	}, [jobId, acknowledge]);

	return { progress, currentStep, status, result, error };
}
