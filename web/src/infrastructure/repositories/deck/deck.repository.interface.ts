import type {
  ClipMetadata,
  DeckRecord,
} from "#/infrastructure/database/indexed-db.types";

type ClipPositionDetails = {
  position: number;
  total: number;
};

export interface IDeckStorageRepository {
  saveDeck(deck: DeckRecord): Promise<void>;
  saveClip(clip: ClipMetadata): Promise<void>;
  getDeck(deckId: string): Promise<DeckRecord | null>;
  getClipPosition(sourceFileKey: string): Promise<ClipPositionDetails | null>;
  getClip(
    sourceFileKey: string,
  ): Promise<(ClipMetadata & ClipPositionDetails) | null>;
  getNextClip(
    sourceFileKey: string,
  ): Promise<(ClipMetadata & ClipPositionDetails) | null>;
  getClipBlob(sourceFileKey: string): Promise<Blob | null>;
  deleteDeck(deckId: string): Promise<void>;
  deleteClipsByDeck(deckId: string): Promise<void>;
  cleanUp(): Promise<void>;
}
