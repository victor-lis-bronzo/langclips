import type { DeckRecord } from "#/infrastructure/database/indexed-db.types";

export interface IDeckStorageRepository {
  saveDeck(deck: DeckRecord): Promise<void>;
  getDeck(deckId: string): Promise<DeckRecord | null>;
  deleteDeck(deckId: string): Promise<void>;
  getAllDecks(): Promise<DeckRecord[]>;
  cleanUp(): Promise<void>;
}
