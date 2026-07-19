import type { DifficultyType } from "../repositories/preferences/preferences.repository.interface";

export interface ClipMetadata {
  id: string;
  deckId: string;
  transcription: string;
  sourceFileKey: string;
  blob: Blob;
  mimeType: string;
  startTime: number;
  endTime: number;
}

export interface DeckRecord {
  id: string;
  sourceFileKey: string;
  clips: Omit<ClipMetadata, "blob" | "mimeType">[];
  createdAt: number;
  downloadedAt: number;
  totalSeconds: number;
}

export interface Exercise {
  id: string;
  deckId: string;
  clipId: string;
  createdAt: number;
  timeSpentMs: number;
  doneAt: number;
  difficulty: DifficultyType;
  status: "CORRECT" | "WRONG";
}
