import { v4 as uuidv4 } from "uuid";
import { Deck, Clip } from "../types/deck.types";
import {
  IDeckBuilderService,
  TranscriptionSegment,
} from "../interfaces/deck-builder.interface";

export class DeckBuilderService implements IDeckBuilderService {
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
    const clips: Clip[] = uploadedClips.map((clip) => {
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
