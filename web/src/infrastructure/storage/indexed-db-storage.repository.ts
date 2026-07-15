import { getDatabase } from "../indexed-db/indexed-db.provider";
import type { DeckRecord, ClipMetadata } from "../indexed-db/indexed-db.types";
import type { IDeckStorageRepository } from "./storage.repository";

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

  async getClip(sourceFileKey: string): Promise<ClipMetadata | null> {
    const db = await getDatabase();
    const clip = await db.get("clips", sourceFileKey);
    return clip || null;
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
}
