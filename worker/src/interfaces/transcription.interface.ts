import { TranscriptionSegment } from "./deck-builder.interface";

export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
  words?: Array<{ word: string; start: number; end: number }>;
};

export type WhisperWord = {
  word: string;
  start: number;
  end: number;
};

export type WhisperResponse = {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
  words?: WhisperWord[];
};

export interface ITranscriptionService {
  transcribe({
    audioPath,
  }: {
    audioPath: string;
  }): Promise<{ success: boolean; transcriptionData: TranscriptionSegment[] }>;
}

