export interface WordToken {
  text: string;
  start: number;
  end: number;
  isGapCandidate: boolean;
}

export interface Clip {
  id: string;
  startTime: number;
  endTime: number;
  fullTranscription: string;
  tokens: WordToken[];
}

export interface Deck {
  id: string;
  title: string;
  sourceFileKey: string;
  clips: Clip[];
  createdAt: number;
}
