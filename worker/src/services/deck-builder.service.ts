import { v4 as uuidv4 } from "uuid";
import { Deck, Clip } from "../types/deck.types";
import {
  IDeckBuilderService,
  TranscriptionSegment,
} from "../interfaces/deck-builder.interface";

export class DeckBuilderService implements IDeckBuilderService {
  constructor(
    private readonly MIN_CLIP_DURATION: number = 2,
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
        transcription: segment.text,
        sourceFileKey,
        startTime: segment.start,
        endTime: segment.end,
      }));

    return {
      id: uuidv4(),
      title,
      clips,
      createdAt: Date.now(),
    };
  }
}
