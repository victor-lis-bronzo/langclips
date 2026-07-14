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

        const consolidatedSegments = this.consolidateSegments(data.segments);
        const confidentSegments = this.filterConfidentSegments(consolidatedSegments);
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

  private consolidateSegments(segments: WhisperSegment[]): WhisperSegment[] {
    if (segments.length === 0) return [];

    const consolidated: WhisperSegment[] = [];
    let currentGroup: WhisperSegment[] = [];

    const MAX_DURATION = 15; // 15 seconds
    const MIN_DURATION = 5;  // 5 seconds
    const MAX_GAP = 2.0;     // 2 seconds gap of silence

    const isSentenceEnd = (text: string): boolean => {
      const trimmed = text.trim();
      const cleanText = trimmed.replace(/["'”’]+$/, "");
      return /[.!?]$/.test(cleanText);
    };

    for (const seg of segments) {
      if (currentGroup.length > 0) {
        const lastInGroup = currentGroup[currentGroup.length - 1];
        const gap = seg.start - lastInGroup.end;
        const groupStart = currentGroup[0].start;
        const currentDuration = seg.end - groupStart;

        // Se houver um gap muito grande de silêncio, ou se adicionar este segmento estourar a duração máxima
        if (gap > MAX_GAP || currentDuration > MAX_DURATION) {
          consolidated.push(this.mergeSegments(currentGroup));
          currentGroup = [seg];
          continue;
        }
      }

      currentGroup.push(seg);

      const groupStart = currentGroup[0].start;
      const duration = seg.end - groupStart;
      const endsWithSentencePunctuation = isSentenceEnd(seg.text);

      if (endsWithSentencePunctuation && duration >= MIN_DURATION) {
        consolidated.push(this.mergeSegments(currentGroup));
        currentGroup = [];
      }
    }

    if (currentGroup.length > 0) {
      const mergedResidual = this.mergeSegments(currentGroup);
      const residualDuration = mergedResidual.end - mergedResidual.start;
      const hasPunctuation = isSentenceEnd(mergedResidual.text);

      if (residualDuration >= MIN_DURATION) {
        // É grande o suficiente, mantemos (mesmo sem pontuação, pois pode ter sido cortado no final)
        consolidated.push(mergedResidual);
      } else {
        // Se o grupo residual for menor que a duração mínima
        if (consolidated.length > 0) {
          const lastConsolidated = consolidated[consolidated.length - 1];
          const combinedDuration = mergedResidual.end - lastConsolidated.start;
          const gap = mergedResidual.start - lastConsolidated.end;
          
          const lastHasPunctuation = isSentenceEnd(lastConsolidated.text);

          // Tenta mesclar para trás. Só mescla se:
          // 1. Não estourar o limite de tempo e gap.
          // 2. Não sujar uma frase já perfeitamente pontuada com um fragmento solto (sem pontuação).
          if (combinedDuration <= MAX_DURATION && gap <= MAX_GAP && (!lastHasPunctuation || hasPunctuation)) {
            consolidated.pop();
            consolidated.push(this.mergeSegments([lastConsolidated, mergedResidual]));
          } else {
            // Não pode mesclar. Se o fragmento for inútil (sem pontuação e muito curto), nós o descartamos
            // para não poluir os clips finais gerados.
            if (hasPunctuation) {
              consolidated.push(mergedResidual);
            }
          }
        } else {
          // É o único segmento que temos, então não descartamos.
          consolidated.push(mergedResidual);
        }
      }
    }

    return consolidated;
  }

  private mergeSegments(group: WhisperSegment[]): WhisperSegment {
    if (group.length === 1) return group[0];

    const first = group[0];
    const last = group[group.length - 1];

    const mergedText = group
      .map((s) => s.text.trim())
      .filter(Boolean)
      .join(" ");

    const mergedTokens = group.flatMap((s) => s.tokens || []);
    const mergedWords = group.some((s) => s.words)
      ? group.flatMap((s) => s.words || [])
      : undefined;

    // Calcula médias ponderadas pela duração para os metadados de confiança
    let totalDuration = 0;
    let sumLogprob = 0;
    let sumCompressionRatio = 0;
    let sumNoSpeechProb = 0;
    let sumTemp = 0;

    for (const s of group) {
      const d = Math.max(s.end - s.start, 0.001);
      totalDuration += d;
      sumLogprob += s.avg_logprob * d;
      sumCompressionRatio += s.compression_ratio * d;
      sumNoSpeechProb += s.no_speech_prob * d;
      sumTemp += s.temperature * d;
    }

    const avgLogprob = sumLogprob / totalDuration;
    const compressionRatio = sumCompressionRatio / totalDuration;
    const noSpeechProb = sumNoSpeechProb / totalDuration;
    const temp = sumTemp / totalDuration;

    return {
      id: first.id,
      seek: first.seek,
      start: first.start,
      end: last.end,
      text: mergedText,
      tokens: mergedTokens,
      temperature: temp,
      avg_logprob: avgLogprob,
      compression_ratio: compressionRatio,
      no_speech_prob: noSpeechProb,
      words: mergedWords,
    };
  }
}
