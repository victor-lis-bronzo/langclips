import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import {
  ITranscriptionService,
  WhisperResponse,
  WhisperSegment,
} from "../interfaces/transcription.interface";
import { TranscriptionSegment } from "../interfaces/deck-builder.interface";
import { IAudioChunkerService, AudioChunk } from "../interfaces/audio-chunker.interface";

export class WhisperTranscriptionService implements ITranscriptionService {
  constructor(
    private readonly GROQ_API_KEY: string,
    private readonly audioChunker: IAudioChunkerService,
    private readonly MIN_AVG_LOGPROB: number = -0.6,
    private readonly MAX_NO_SPEECH_PROB: number = 0.4,
    private readonly MIN_COMPRESSION_RATIO: number = 0.8,
    private readonly MAX_COMPRESSION_RATIO: number = 2.4,
  ) {}

  async transcribe({
    audioPath,
  }: {
    audioPath: string;
  }): Promise<{ success: boolean; transcriptionData: TranscriptionSegment[] }> {
    const stat = fs.statSync(audioPath);
    const MAX_FILE_SIZE = 24 * 1024 * 1024; // 24MB limit
    
    let chunks: AudioChunk[] = [];
    let isChunked = false;

    if (stat.size > MAX_FILE_SIZE) {
      console.log(`[transcription.service.ts] Arquivo maior que 24MB. Realizando chunking via AudioChunkerService...`);
      const result = await this.audioChunker.chunkAudio({
        audioPath,
        chunkDurationSeconds: 600, // 10 minutes
      });
      chunks = result.chunks;
      isChunked = true;
    } else {
      chunks = [{ path: audioPath, startTimeOffset: 0 }];
    }

    try {
      let allTranscriptionData: TranscriptionSegment[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        if (isChunked) {
          console.log(`[transcription.service.ts] Transcrevendo chunk ${i + 1}/${chunks.length}...`);
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(chunk.path));
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "verbose_json"); 
        formData.append("timestamp_granularities[]", "word");
        formData.append("timestamp_granularities[]", "segment");

        const response = await axios.post<WhisperResponse>(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${this.GROQ_API_KEY}`,
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          },
        );

        const data = response.data;

        const confidentSegments = this.filterConfidentSegments(data.segments);
        let transcriptionData = this.mapToDeckSegments(confidentSegments);

        if (chunk.startTimeOffset > 0) {
          transcriptionData = transcriptionData.map(seg => ({
            text: seg.text,
            start: seg.start + chunk.startTimeOffset,
            end: seg.end + chunk.startTimeOffset,
          }));
        }

        allTranscriptionData = allTranscriptionData.concat(transcriptionData);
        
        if (isChunked && fs.existsSync(chunk.path)) {
          fs.unlinkSync(chunk.path);
        }
      }

      return {
        success: true,
        transcriptionData: allTranscriptionData,
      };
    } catch (error) {
      console.error("[transcription.service.ts] Falha na transcrição:", error);
      if (isChunked) {
        chunks.forEach((chunk) => {
          if (fs.existsSync(chunk.path)) fs.unlinkSync(chunk.path);
        });
      }
      throw error;
    }
  }

  private filterConfidentSegments(
    segments: WhisperSegment[],
  ): WhisperSegment[] {
    return segments.filter(
      (seg) =>
        seg.avg_logprob >= this.MIN_AVG_LOGPROB &&
        seg.no_speech_prob <= this.MAX_NO_SPEECH_PROB &&
        seg.compression_ratio >= this.MIN_COMPRESSION_RATIO &&
        seg.compression_ratio <= this.MAX_COMPRESSION_RATIO,
    );
  }

  private mapToDeckSegments(
    segments: WhisperSegment[],
  ): TranscriptionSegment[] {
    return segments.map((seg) => ({
      text: seg.text.trim(),
      start: seg.start,
      end: seg.end,
    }));
  }
}
