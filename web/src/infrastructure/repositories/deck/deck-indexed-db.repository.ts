import { getDatabase } from "#/infrastructure/database/indexed-db.provider";
import type {
  ClipMetadata,
  DeckRecord,
} from "#/infrastructure/database/indexed-db.types";
import type { IDeckStorageRepository } from "./deck.repository.interface";

export class IndexedDbStorageRepository implements IDeckStorageRepository {
  async saveDeck(deck: DeckRecord): Promise<void> {
    const db = await getDatabase();
    await db.put("decks", deck);
  }

  async saveClip(clip: ClipMetadata): Promise<void> {
    const db = await getDatabase();
    await db.put("clips", clip);
  }

  async getDeck(deckId: string): Promise<DeckRecord | null> {
    const db = await getDatabase();
    const deck = await db.get("decks", deckId);
    return deck || null;
  }

  async getAllDecks() {
    const db = await getDatabase();
    const deck = await db.getAll("decks");
    return deck;
  }

  async getClipPosition(
    sourceFileKey: string,
  ): Promise<{ position: number; total: number } | null> {
    const db = await getDatabase();
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
    const db = await getDatabase();
    const clip = await db.get("clips", sourceFileKey);
    const position = await this.getClipPosition(sourceFileKey);

    if (!clip || !position) return null;

    return {
      ...clip,
      ...position,
    };
  }

  async getNextClip(sourceFileKey: string) {
    const db = await getDatabase();
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
    const position = await this.getClipPosition(clip.sourceFileKey);

    if (!clip || !position) return null;

    return {
      ...clip,
      ...position,
    };
  }

  async getClipBlob(sourceFileKey: string): Promise<Blob | null> {
    const clip = await this.getClip(sourceFileKey);
    return clip ? clip.blob : null;
  }

  async deleteDeck(deckId: string): Promise<void> {
    const db = await getDatabase();
    await db.delete("decks", deckId);
  }

  async deleteClipsByDeck(deckId: string): Promise<void> {
    const db = await getDatabase();
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
    const db = await getDatabase();
    await db.clear("decks");
    await db.clear("clips");
  }
}
