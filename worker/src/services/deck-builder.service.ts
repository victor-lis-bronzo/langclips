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
    const clips: Omit<Clip, "startTime" | "endTime">[] = uploadedClips.map(
      (clip) => {
        return {
          id: clip.id,
          transcription: clip.transcription,
          sourceFileKey: clip.sourceFileKey,
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
