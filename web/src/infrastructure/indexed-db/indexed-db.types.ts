export interface ClipMetadata {
  id: string;
  deckId: string;
  transcription: string;
  sourceFileKey: string;
  blob: Blob;
  mimeType: string;
}

export interface DeckRecord {
  id: string;
  sourceFileKey: string;
  clips: Omit<ClipMetadata, "blob" | "mimeType">[];
  createdAt: number;
  downloadedAt: number;
}
