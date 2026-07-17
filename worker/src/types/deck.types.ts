export interface Clip {
  id: string;
  transcription: string;
  sourceFileKey: string;
  startTime: number;
  endTime: number;
}

export interface Deck {
  id: string;
  sourceFileKey: string;
  clips: Clip[];
  createdAt: number;
}
