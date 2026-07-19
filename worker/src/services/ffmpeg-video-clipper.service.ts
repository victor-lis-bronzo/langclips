import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import {
  ClipCreationRequest,
  IVideoClipperService,
} from "../interfaces/video-clipper.interface";
import { LocalGeneratedClip } from "../interfaces/video-clipper.interface";

export class FFmpegVideoClipperService implements IVideoClipperService {
  constructor() {
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  async generateClips({
    sourceFilePath,
    requests,
  }: {
    sourceFilePath: string;
    requests: ClipCreationRequest[];
  }) {
    const tmpDir = os.tmpdir();
    const clips: LocalGeneratedClip[] = [];

    for (const [index, request] of requests.entries()) {
      const clipId = crypto.randomUUID();
      const tempFilePath = path.join(tmpDir, `${clipId}.mp4`);

      try {
        await new Promise<void>((resolve, reject) => {
          ffmpeg(sourceFilePath)
            .setStartTime(request.startTime)
            .setDuration(request.endTime - request.startTime)
            .outputOptions([
              "-c:v libx264",
              "-preset superfast",
              "-c:a aac",
              "-avoid_negative_ts",
              "make_zero",
            ])
            .output(tempFilePath)
            .on("start", (commandLine) => {
              console.log(
                `[CLIPPER] Executando comando ffmpeg: ${commandLine}`,
              );
            })
            .on("end", () => resolve())
            .on("error", (err) => reject(err))
            .run();
        });

        clips.push({
          id: clipId,
          tempFilePath,
          transcription: request.transcription,
          startTime: request.startTime,
          endTime: request.endTime,
        });
      } catch (error) {
        console.error(`[CLIPPER] Erro ao criar clip ${clipId}:`, error);
        // Continua com os outros clips mesmo se um falhar
      }
    }

    return { success: clips.length > 0, clips };
  }
}
