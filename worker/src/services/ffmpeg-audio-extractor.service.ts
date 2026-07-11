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
  }): Promise<{ outputPath: string }> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioQuality(2)
        .output(outputPath)
        .on("end", () => resolve({ outputPath }))
        .on("error", (err) => reject(err))
        .run();
    });
  }
}
