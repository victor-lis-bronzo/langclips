import { Deck } from "../types/deck.types";

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  words: Array<{ word: string; start: number; end: number }>;
}

export interface IDeckBuilderService {
  /**
   * Constrói um Deck a partir do título e dados de transcrição.
   */
  build(params: {
    title: string;
    sourceFileKey: string;
    transcriptionData: TranscriptionSegment[];
  }): Deck;
}
