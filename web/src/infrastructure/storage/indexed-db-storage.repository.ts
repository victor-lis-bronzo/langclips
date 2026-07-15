import { getDatabase } from "../indexed-db/indexed-db.provider";
import type { DeckRecord, ClipRecord } from "../indexed-db/indexed-db.types";
import type { IDeckStorageRepository } from "./storage.repository";

export class IndexedDbStorageRepository implements IDeckStorageRepository {
  async saveDeck(deck: DeckRecord): Promise<void> {
    const db = await getDatabase();
    await db.put("decks", deck);
  }

  async saveClip(clip: ClipRecord): Promise<void> {
    const db = await getDatabase();
    await db.put("clips", clip);
  }

  async getDeck(deckId: string): Promise<DeckRecord | null> {
    const db = await getDatabase();
    const deck = await db.get("decks", deckId);
    return deck || null;
  }

  async getClip(sourceFileKey: string): Promise<ClipRecord | null> {
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
    const index = tx.store.index("by-deck");
    let cursor = await index.openCursor(IDBKeyRange.only(deckId));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }
}
