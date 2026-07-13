import { v4 as uuidv4 } from "uuid";
import { Deck, Clip, WordToken } from "../types/deck.types";
import {
  IDeckBuilderService,
  TranscriptionSegment,
} from "../interfaces/deck-builder.interface";

export class DeckBuilderService implements IDeckBuilderService {
  constructor(
    private readonly MIN_CLIP_DURATION: number = 5,
    private readonly MAX_CLIP_DURATION: number = 20,
  ) {}

  build({
    title,
    sourceFileKey,
    transcriptionData,
  }: {
    title: string;
    sourceFileKey: string;
    transcriptionData: TranscriptionSegment[];
  }): Deck {
    const clips: Clip[] = transcriptionData
      .filter((segment) => {
        const duration = segment.end - segment.start;
        return (
          duration >= this.MIN_CLIP_DURATION &&
          duration <= this.MAX_CLIP_DURATION
        );
      })
      .map((segment) => ({
        id: uuidv4(),
        startTime: segment.start,
        endTime: segment.end,
        fullTranscription: segment.text,
        tokens: this.buildTokens({ words: segment.words }),
      }));

    return {
      id: uuidv4(),
      title,
      sourceFileKey,
      clips,
      createdAt: Date.now(),
    };
  }

  private buildTokens({
    words,
  }: {
    words: Array<{ word: string; start: number; end: number }>;
  }): WordToken[] {
    return words.map((word, index) => ({
      text: word.word,
      start: word.start,
      end: word.end,
      isGapCandidate: index % 3 === 1,
    }));
  }
}
