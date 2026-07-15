/**
 * Metadados de um clip dentro do DeckRecord (sem o blob do vídeo)
 */
export interface ClipMetadata {
  id: string;
  transcription: string;
  sourceFileKey: string;
}

/**
 * Registro do Deck salvo localmente no store 'decks'
 */
export interface DeckRecord {
  id: string;
  sourceFileKey: string;
  clips: ClipMetadata[];
  createdAt: number;
  downloadedAt: number; // timestamp de quando foi salvo localmente
}

/**
 * Registro do clip com o vídeo binário salvo localmente no store 'clips'
 */
export interface ClipRecord {
  sourceFileKey: string; // key primária
  deckId: string;        // referência ao deck pai
  blob: Blob;            // vídeo binário
  mimeType: string;
}
