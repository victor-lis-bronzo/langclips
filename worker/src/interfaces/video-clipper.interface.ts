export interface ClipCreationRequest {
  startTime: number;
  endTime: number;
  transcription: string;
}

export interface LocalGeneratedClip {
  id: string;
  tempFilePath: string;
  transcription: string;
  startTime: number;
  endTime: number;
}

export interface IVideoClipperService {
  generateClips({
    sourceFilePath,
    requests,
  }: {
    sourceFilePath: string;
    requests: ClipCreationRequest[];
  }): Promise<{ clips: LocalGeneratedClip[]; success: boolean }>;
}
