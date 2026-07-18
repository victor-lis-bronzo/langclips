import axios from "axios";
import type {
	ClipMetadata,
	DeckRecord,
} from "../../../infrastructure/database/indexed-db.types";
import type { Deck } from "../types/deck.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export class DeckDownloadService {
	/**
	 * Baixa os vídeos dos clipes a partir do R2 via presigned URLs geradas pela API
	 * e monta as estruturas para persistência.
	 */
	async downloadDeckAssets(deck: Deck): Promise<{
		deckRecord: DeckRecord;
		clipRecords: ClipMetadata[];
	}> {
		const clipRecords: ClipMetadata[] = [];

		// Fazer download de todos os clipes de vídeo em paralelo para melhor performance
		const downloadPromises = deck.clips.map(async (clip) => {
			// 1. Obter a URL presignada de leitura na API NestJS
			const response = await axios.get<{ downloadUrl: string }>(
				`${API_BASE_URL}/storage/download-url`,
				{
					params: { fileKey: clip.sourceFileKey },
				},
			);

			const { downloadUrl } = response.data;

			// 2. Obter o blob binário do R2 usando a URL temporária
			const blobResponse = await fetch(downloadUrl);
			if (!blobResponse.ok) {
				throw new Error(
					`Falha ao baixar o arquivo de vídeo para o clipe: ${clip.id}`,
				);
			}
			const blob = await blobResponse.blob();

			clipRecords.push({
				id: clip.id,
				transcription: clip.transcription,
				sourceFileKey: clip.sourceFileKey,
				deckId: deck.id,
				blob,
				mimeType: blob.type || "video/mp4",
				startTime: clip.startTime,
				endTime: clip.endTime,
			});
		});

		await Promise.all(downloadPromises);

		const deckRecord: DeckRecord = {
			id: deck.id,
			sourceFileKey: deck.sourceFileKey,
			clips: clipRecords.map(({ blob, mimeType, ...rest }) => rest),
			createdAt: deck.createdAt,
			downloadedAt: Date.now(),
			totalSeconds:
				clipRecords.reduce((acc, clip) => {
					const duration = (clip.endTime ?? 0) - (clip.startTime ?? 0);
					return acc + (duration > 0 ? duration : 0);
				}, 0) ?? 0,
		};

		return { deckRecord, clipRecords };
	}
}
