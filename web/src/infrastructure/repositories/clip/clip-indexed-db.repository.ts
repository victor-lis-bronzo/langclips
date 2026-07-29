import { BaseIndexedDbRepository } from "#/infrastructure/database/base-indexed-db.repository";
import type { ClipMetadata, StoredClipRecord } from "#/infrastructure/database/indexed-db.types";
import type { IClipStorageRepository } from "./clip.repository.interface";

interface LegacyClipRecord {
	id: string;
	transcription: string;
	sourceFileKey: string;
	blob?: Blob;
	blobBuffer?: ArrayBuffer;
	mimeType?: string;
	startTime?: number;
	endTime?: number;
}

function extractBlob(record: StoredClipRecord | LegacyClipRecord): Blob {
	if (record.blobBuffer) {
		return new Blob([record.blobBuffer], { type: record.mimeType || "video/mp4" });
	}
	if (record.blob && typeof record.blob === "object") {
		return record.blob;
	}
	return new Blob([], { type: record.mimeType || "video/mp4" });
}

export class IndexedDbClipRepository
	extends BaseIndexedDbRepository
	implements IClipStorageRepository
{
	async saveClip(clip: ClipMetadata): Promise<void> {
		const db = await this.getDb();
		const blobBuffer = clip.blob ? await clip.blob.arrayBuffer() : new ArrayBuffer(0);
		const storedClip: StoredClipRecord = {
			id: clip.id,
			deckId: clip.deckId,
			transcription: clip.transcription,
			sourceFileKey: clip.sourceFileKey,
			blobBuffer,
			mimeType: clip.mimeType || "video/mp4",
			startTime: clip.startTime,
			endTime: clip.endTime,
		};
		await db.put("clips", storedClip);
	}

	async getClipById(deckId: string, clipId: string) {
		const db = await this.getDb();
		const deck = await db.get("decks", deckId);
		if (!deck) return null;

		const clipInfoIndex = deck.clips.findIndex((c) => c.id === clipId);
		if (clipInfoIndex === -1) return null;

		let clipRecord = await db.get("clips", clipId);
		if (!clipRecord) {
			const legacyClip = (deck.clips as unknown as LegacyClipRecord[])[clipInfoIndex];
			if (legacyClip && (legacyClip.blob || legacyClip.blobBuffer)) {
				const blob = extractBlob(legacyClip);
				const blobBuffer = await blob.arrayBuffer();
				clipRecord = {
					id: legacyClip.id,
					deckId: deck.id,
					transcription: legacyClip.transcription,
					sourceFileKey: legacyClip.sourceFileKey,
					blobBuffer,
					mimeType: legacyClip.mimeType || "video/mp4",
					startTime: legacyClip.startTime ?? 0,
					endTime: legacyClip.endTime ?? 0,
				};
				await db.put("clips", clipRecord);
			}
		}

		if (!clipRecord) return null;

		const blob = extractBlob(clipRecord);
		const clip: ClipMetadata = {
			id: clipRecord.id,
			deckId: clipRecord.deckId,
			transcription: clipRecord.transcription,
			sourceFileKey: clipRecord.sourceFileKey,
			blob,
			mimeType: clipRecord.mimeType || "video/mp4",
			startTime: clipRecord.startTime ?? 0,
			endTime: clipRecord.endTime ?? 0,
		};

		return {
			...clip,
			position: clipInfoIndex + 1,
			total: deck.clips.length,
		};
	}

	async getClipBlobById(clipId: string): Promise<Blob | null> {
		const db = await this.getDb();
		const clipRecord = await db.get("clips", clipId);
		if (clipRecord) {
			return extractBlob(clipRecord);
		}

		const decks = await db.getAll("decks");
		for (const deck of decks) {
			const legacyClip = (deck.clips as unknown as LegacyClipRecord[])?.find((c) => c.id === clipId);
			if (legacyClip && (legacyClip.blob || legacyClip.blobBuffer)) {
				const blob = extractBlob(legacyClip);
				const blobBuffer = await blob.arrayBuffer();
				const migratedClip: StoredClipRecord = {
					id: legacyClip.id,
					deckId: deck.id,
					transcription: legacyClip.transcription,
					sourceFileKey: legacyClip.sourceFileKey,
					blobBuffer,
					mimeType: legacyClip.mimeType || "video/mp4",
					startTime: legacyClip.startTime ?? 0,
					endTime: legacyClip.endTime ?? 0,
				};
				await db.put("clips", migratedClip);
				return blob;
			}
		}

		return null;
	}

	async getNextClipById(
		deckId: string,
		clipId: string,
	): Promise<Omit<ClipMetadata, "blob" | "mimeType"> | null> {
		const db = await this.getDb();
		const deck = await db.get("decks", deckId);
		if (!deck) return null;

		const currentClipIndex = deck.clips.findIndex((c) => c.id === clipId);
		if (currentClipIndex === -1) return null;

		const nextClipInfo = deck.clips[currentClipIndex + 1];
		if (!nextClipInfo) return null;

		return nextClipInfo;
	}

	async deleteClipsByDeck(deckId: string): Promise<void> {
		const db = await this.getDb();
		const tx = db.transaction("clips", "readwrite");
		let cursor = await tx.store.openCursor();

		while (cursor) {
			if (cursor.value.deckId === deckId) {
				await cursor.delete();
			}
			cursor = await cursor.continue();
		}

		await tx.done;
	}

	async cleanUp(): Promise<void> {
		const db = await this.getDb();
		await db.clear("clips");
	}
}
