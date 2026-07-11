import { v4 as uuidv4 } from "uuid";
import { Deck, Clip, WordToken } from "../types/deck.types";
import {
  IDeckBuilderService,
  TranscriptionSegment,
} from "../interfaces/deck-builder.interface";

const MIN_CLIP_DURATION = 5;  // BR01: mínimo 5s
const MAX_CLIP_DURATION = 20; // BR01: máximo 20s

export class DeckBuilderService implements IDeckBuilderService {
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
        return duration >= MIN_CLIP_DURATION && duration <= MAX_CLIP_DURATION;
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
