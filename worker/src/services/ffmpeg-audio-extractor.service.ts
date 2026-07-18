import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { IAudioExtractorService } from "../interfaces/audio-extractor.interface";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export class FFmpegAudioExtractorService implements IAudioExtractorService {
  constructor() {
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  private async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const ffmpegBin = ffmpegPath || "ffmpeg";
      const { stderr } = await execPromise(`"${ffmpegBin}" -i "${videoPath}"`);
      return this.parseDuration(stderr);
    } catch (error: any) {
      if (error.stderr) {
        return this.parseDuration(error.stderr);
      }
      console.error("[AUDIO-EXTRACTOR] Erro ao obter duração do vídeo:", error);
      return 0;
    }
  }

  private parseDuration(ffmpegOutput: string): number {
    const match = ffmpegOutput.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseInt(match[3], 10);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

  async extract({
    videoPath,
    outputPath,
  }: {
    videoPath: string;
    outputPath: string;
  }): Promise<{ outputPath: string; success: boolean; startOffset: number }> {
    const totalDuration = await this.getVideoDuration(videoPath);
    console.log(`[AUDIO-EXTRACTOR] Duração total do vídeo: ${totalDuration}s`);

    const MAX_DURATION = 300; // 5 minutos em segundos
    let startOffset = 0;
    let duration = totalDuration;

    if (totalDuration > MAX_DURATION) {
      // Sorteia um tempo de início aleatório que garanta um trecho de até 5 minutos
      startOffset = Math.floor(Math.random() * (totalDuration - MAX_DURATION));
      duration = MAX_DURATION;
      console.log(
        `[AUDIO-EXTRACTOR] Vídeo longo. Selecionando trecho aleatório: ${startOffset}s até ${
          startOffset + MAX_DURATION
        }s`,
      );
    } else {
      console.log(`[AUDIO-EXTRACTOR] Vídeo curto. Extraindo áudio completo de ${duration}s`);
    }

    return new Promise((resolve) => {
      const command = ffmpeg(videoPath);

      if (startOffset > 0) {
        command.seekInput(startOffset);
      }

      command
        .duration(duration)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioQuality(2)
        .output(outputPath)
        .on("end", () => {
          console.log(`[AUDIO-EXTRACTOR] Áudio extraído com sucesso com startOffset=${startOffset}s`);
          resolve({ outputPath, success: true, startOffset });
        })
        .on("error", (err) => {
          console.error("[AUDIO-EXTRACTOR] Erro na extração de áudio:", err);
          resolve({ outputPath: "", success: false, startOffset: 0 });
        })
        .run();
    });
  }
}
