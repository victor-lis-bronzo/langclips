import { Deck, Clip } from "../types/deck.types";

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  words: Array<{ word: string; start: number; end: number }>;
}

export interface IDeckBuilderService {
  /**
   * Constrói um Deck a partir do título, dados de transcrição e clipes enviados.
   */
  build(params: {
    title: string;
    sourceFileKey: string;
    transcriptionData: TranscriptionSegment[];
    uploadedClips: Clip[];
  }): Deck;
}
