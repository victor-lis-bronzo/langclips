export interface Clip {
  id: string;
  transcription: string;
  sourceFileKey: string;
  startTime: number;
  endTime: number;
}

export interface Deck {
  id: string;
  title: string;
  clips: Clip[];
  createdAt: number;
}
