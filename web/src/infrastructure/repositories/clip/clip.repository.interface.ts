import type { ClipMetadata } from "#/infrastructure/database/indexed-db.types";

export type ClipPositionDetails = {
	position: number;
	total: number;
};

export interface IClipStorageRepository {
	saveClip(clip: ClipMetadata): Promise<void>;
	getClipById(
		deckId: string,
		clipId: string,
	): Promise<(ClipMetadata & ClipPositionDetails) | null>;
	getClipBlobById(clipId: string): Promise<Blob | null>;
	getNextClipById(
		deckId: string,
		clipId: string,
	): Promise<Omit<ClipMetadata, "blob" | "mimeType"> | null>;
	deleteClipsByDeck(deckId: string): Promise<void>;
	cleanUp(): Promise<void>;
}
