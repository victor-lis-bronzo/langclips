import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { ITranscriptionService, WhisperResponse, WhisperSegment } from "../interfaces/transcription.interface";
import { TranscriptionSegment } from "../interfaces/deck-builder.interface";

export class WhisperTranscriptionService implements ITranscriptionService {
  constructor(
    private readonly GROQ_API_KEY: string,
    private readonly MIN_AVG_LOGPROB: number = -0.60,
    private readonly MAX_NO_SPEECH_PROB: number = 0.40,
    private readonly MIN_COMPRESSION_RATIO: number = 0.8,
    private readonly MAX_COMPRESSION_RATIO: number = 2.4,
  ) {}

  async transcribe({ audioPath }: { audioPath: string }): Promise<{ success: boolean; transcriptionData: TranscriptionSegment[] }> {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioPath)); // O áudio extraído pelo ffmpeg
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "verbose_json"); // Absolutamente necessário para obter os timestamps
    formData.append("timestamp_granularities[]", "word");
    formData.append("timestamp_granularities[]", "segment");

    try {
      const response = await axios.post<WhisperResponse>(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.GROQ_API_KEY}`,
          },
        },
      );

      const data = response.data;
      console.log("WHISPER TRANSCRIPTION RAW DATA", data);

      const confidentSegments = this.filterConfidentSegments(data.segments);
      const transcriptionData = this.mapToDeckSegments(confidentSegments);

      return {
        success: true,
        transcriptionData,
      };
    } catch (error) {
      console.error("[transcription.service.ts] Falha na transcrição:", error);
      throw error;
    }
  }

  private filterConfidentSegments(segments: WhisperSegment[]): WhisperSegment[] {
    return segments.filter((seg) =>
      seg.avg_logprob >= this.MIN_AVG_LOGPROB &&
      seg.no_speech_prob <= this.MAX_NO_SPEECH_PROB &&
      seg.compression_ratio >= this.MIN_COMPRESSION_RATIO &&
      seg.compression_ratio <= this.MAX_COMPRESSION_RATIO
    );
  }

  private mapToDeckSegments(segments: WhisperSegment[]): TranscriptionSegment[] {
    return segments.map((seg) => ({
      text: seg.text.trim(),
      start: seg.start,
      end: seg.end,
      words: seg.words ?? [], // word-level timestamps (se disponíveis)
    }));
  }
}

