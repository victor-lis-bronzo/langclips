import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import {
  AudioChunk,
  IAudioChunkerService,
} from "../interfaces/audio-chunker.interface";

export class FFmpegAudioChunkerService implements IAudioChunkerService {
  constructor() {
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  async chunkAudio({
    audioPath,
    chunkDurationSeconds,
  }: {
    audioPath: string;
    chunkDurationSeconds: number;
  }): Promise<{ success: boolean; chunks: AudioChunk[] }> {
    const tmpDir = os.tmpdir();
    const chunkId = crypto.randomUUID();
    const pattern = path.join(tmpDir, `${chunkId}_%03d.mp3`);

    console.log(`[CHUNKER] Separando áudio de ${audioPath} em blocos de ${chunkDurationSeconds}s...`);

    try {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(audioPath)
          .outputOptions([
            "-f segment",
            `-segment_time ${chunkDurationSeconds}`,
            "-c copy",
          ])
          .output(pattern)
          .on("end", () => resolve())
          .on("error", (err: any) => reject(err))
          .run();
      });

      const files = fs.readdirSync(tmpDir);
      const chunkPaths = files
        .filter((f) => f.startsWith(chunkId) && f.endsWith(".mp3"))
        .sort()
        .map((f) => path.join(tmpDir, f));

      const chunks: AudioChunk[] = chunkPaths.map((chunkPath, index) => ({
        path: chunkPath,
        startTimeOffset: index * chunkDurationSeconds,
      }));

      console.log(`[CHUNKER] Gerados ${chunks.length} chunks.`);

      return {
        success: true,
        chunks,
      };
    } catch (error) {
      console.error("[CHUNKER] Falha ao separar áudio:", error);
      throw error;
    }
  }
}
