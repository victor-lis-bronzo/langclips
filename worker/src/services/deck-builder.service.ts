import { Deck, Clip } from "../types/deck.types";
import { IDeckBuilderService } from "../interfaces/deck-builder.interface";

export class DeckBuilderService implements IDeckBuilderService {
  build({
    jobId,
    sourceFileKey,
    uploadedClips,
  }: {
    jobId: string;
    sourceFileKey: string;
    uploadedClips: Clip[];
  }): Deck {
    const clips: Clip[] = uploadedClips.map(
      (clip) => {
        return {
          id: clip.id,
          transcription: clip.transcription,
          sourceFileKey: clip.sourceFileKey,
          startTime: clip.startTime,
          endTime: clip.endTime,
        };
      },
    );

    return {
      id: jobId,
      sourceFileKey,
      clips,
      createdAt: Date.now(),
    };
  }
}
