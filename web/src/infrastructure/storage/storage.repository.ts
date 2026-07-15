import type { DeckRecord, ClipRecord } from "../indexed-db/indexed-db.types";

export interface IDeckStorageRepository {
  saveDeck(deck: DeckRecord): Promise<void>;
  saveClip(clip: ClipRecord): Promise<void>;
  getDeck(deckId: string): Promise<DeckRecord | null>;
  getClip(sourceFileKey: string): Promise<ClipRecord | null>;
  getClipBlob(sourceFileKey: string): Promise<Blob | null>;
  deleteDeck(deckId: string): Promise<void>;
  deleteClipsByDeck(deckId: string): Promise<void>;
}
