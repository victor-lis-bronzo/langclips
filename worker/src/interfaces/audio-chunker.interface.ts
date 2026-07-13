export interface AudioChunk {
  path: string;
  startTimeOffset: number;
}

export interface IAudioChunkerService {
  chunkAudio(params: {
    audioPath: string;
    chunkDurationSeconds: number;
  }): Promise<{ success: boolean; chunks: AudioChunk[] }>;
}
