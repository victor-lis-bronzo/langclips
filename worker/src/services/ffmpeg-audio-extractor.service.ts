import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { IAudioExtractorService } from "../interfaces/audio-extractor.interface";

export class FFmpegAudioExtractorService implements IAudioExtractorService {
  constructor() {
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  }

  async extract({
    videoPath,
    outputPath,
  }: {
    videoPath: string;
    outputPath: string;
  }): Promise<{ outputPath: string; success: boolean }> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .duration(60)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioQuality(2)
        .output(outputPath)
        .on("end", () => resolve({ outputPath, success: true }))
        .on("error", () => resolve({ outputPath: "", success: false }))
        .run();
    });
  }
}
