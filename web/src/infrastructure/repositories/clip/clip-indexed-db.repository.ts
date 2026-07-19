import { BaseIndexedDbRepository } from "#/infrastructure/database/base-indexed-db.repository";
import type { ClipMetadata } from "#/infrastructure/database/indexed-db.types";
import type {
  IClipStorageRepository,
  ClipPositionDetails,
} from "./clip.repository.interface";

export class IndexedDbClipRepository
  extends BaseIndexedDbRepository
  implements IClipStorageRepository
{
  async saveClip(clip: ClipMetadata): Promise<void> {
    const db = await this.getDb();
    await db.put("clips", clip);
  }

  async getClipPosition(
    sourceFileKey: string,
  ): Promise<ClipPositionDetails | null> {
    const db = await this.getDb();
    const tx = db.transaction("clips", "readonly");

    const store = tx.store;

    let cursor = await store.openCursor();
    const clips: ClipMetadata[] = [];

    while (cursor) {
      clips.push(cursor.value);
      cursor = await cursor.continue();
    }

    await tx.done;

    const currentClipIndex = clips.findIndex(
      (clip) => clip.sourceFileKey === sourceFileKey,
    );

    return {
      position: currentClipIndex + 1,
      total: clips.length,
    };
  }

  async getClip(sourceFileKey: string) {
    const db = await this.getDb();
    const clip = await db.get("clips", sourceFileKey);
    const position = await this.getClipPosition(sourceFileKey);

    if (!clip || !position) return null;

    return {
      ...clip,
      ...position,
    };
  }

  async getNextClip(sourceFileKey: string) {
    const db = await this.getDb();
    const tx = db.transaction("clips", "readonly");

    const store = tx.store;

    let cursor = await store.openCursor();
    const clips: ClipMetadata[] = [];

    while (cursor) {
      clips.push(cursor.value);
      cursor = await cursor.continue();
    }

    await tx.done;

    const currentClipIndex = clips.findIndex(
      (clip) => clip.sourceFileKey === sourceFileKey,
    );

    const clip = clips[currentClipIndex + 1];
    if (!clip) return null;
    const position = await this.getClipPosition(clip.sourceFileKey);

    if (!position) return null;

    return {
      ...clip,
      ...position,
    };
  }

  async getClipBlob(sourceFileKey: string): Promise<Blob | null> {
    const clip = await this.getClip(sourceFileKey);
    return clip ? clip.blob : null;
  }

  async getClipById(deckId: string, clipId: string) {
    const db = await this.getDb();
    const deck = await db.get("decks", deckId);
    if (!deck) return null;
    const clipInfo = deck.clips.find((c) => c.id === clipId);
    if (!clipInfo) return null;
    return this.getClip(clipInfo.sourceFileKey);
  }

  async getClipBlobById(deckId: string, clipId: string): Promise<Blob | null> {
    const db = await this.getDb();
    const deck = await db.get("decks", deckId);
    if (!deck) return null;
    const clipInfo = deck.clips.find((c) => c.id === clipId);
    if (!clipInfo) return null;
    return this.getClipBlob(clipInfo.sourceFileKey);
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
