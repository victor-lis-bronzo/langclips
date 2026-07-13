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
    uploadedClips,
  }: {
    title: string;
    sourceFileKey: string;
    transcriptionData: TranscriptionSegment[];
    uploadedClips: Clip[];
  }): Deck {
    const clips: Clip[] = uploadedClips
      .filter((clip) => {
        const duration = clip.endTime - clip.startTime;
        return (
          duration >= this.MIN_CLIP_DURATION &&
          duration <= this.MAX_CLIP_DURATION
        );
      })
      .map((clip) => {
        return {
          id: clip.id,
          transcription: clip.transcription,
          sourceFileKey: clip.sourceFileKey,
          startTime: clip.startTime,
          endTime: clip.endTime,
        };
      });

    return {
      id: uuidv4(),
      title,
      clips,
      createdAt: Date.now(),
    };
  }
}
