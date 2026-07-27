import { BaseIndexedDbRepository } from "#/infrastructure/database/base-indexed-db.repository";
import type { ClipMetadata } from "#/infrastructure/database/indexed-db.types";
import type { IClipStorageRepository } from "./clip.repository.interface";

export class IndexedDbClipRepository
  extends BaseIndexedDbRepository
  implements IClipStorageRepository
{
  async saveClip(clip: ClipMetadata): Promise<void> {
    const db = await this.getDb();
    await db.put("clips", clip);
  }

  async getClipById(deckId: string, clipId: string) {
    const db = await this.getDb();
    const deck = await db.get("decks", deckId);
    if (!deck) return null;

    const clipInfoIndex = deck.clips.findIndex((c) => c.id === clipId);
    if (clipInfoIndex === -1) return null;

    const clip = await db.get("clips", clipId);
    if (!clip) return null;

    return {
      ...clip,
      position: clipInfoIndex + 1,
      total: deck.clips.length,
    };
  }

  async getClipBlobById(clipId: string): Promise<Blob | null> {
    const db = await this.getDb();
    const clip = await db.get("clips", clipId);
    return clip ? clip.blob : null;
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
