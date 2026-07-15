import type { DeckRecord, ClipMetadata } from "../indexed-db/indexed-db.types";

export interface IDeckStorageRepository {
  saveDeck(deck: DeckRecord): Promise<void>;
  saveClip(clip: ClipMetadata): Promise<void>;
  getDeck(deckId: string): Promise<DeckRecord | null>;
  getClip(sourceFileKey: string): Promise<ClipMetadata | null>;
  getClipBlob(sourceFileKey: string): Promise<Blob | null>;
  deleteDeck(deckId: string): Promise<void>;
  deleteClipsByDeck(deckId: string): Promise<void>;
}
