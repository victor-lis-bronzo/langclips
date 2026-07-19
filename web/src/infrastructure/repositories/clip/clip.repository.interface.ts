import type { ClipMetadata } from "#/infrastructure/database/indexed-db.types";

export type ClipPositionDetails = {
	position: number;
	total: number;
};

export interface IClipStorageRepository {
	saveClip(clip: ClipMetadata): Promise<void>;
	getClipPosition(sourceFileKey: string): Promise<ClipPositionDetails | null>;
	getClip(
		sourceFileKey: string,
	): Promise<(ClipMetadata & ClipPositionDetails) | null>;
	getNextClip(
		sourceFileKey: string,
	): Promise<(ClipMetadata & ClipPositionDetails) | null>;
	getClipBlob(sourceFileKey: string): Promise<Blob | null>;
	getClipById(
		deckId: string,
		clipId: string,
	): Promise<(ClipMetadata & ClipPositionDetails) | null>;
	getClipBlobById(deckId: string, clipId: string): Promise<Blob | null>;
	deleteClipsByDeck(deckId: string): Promise<void>;
}
