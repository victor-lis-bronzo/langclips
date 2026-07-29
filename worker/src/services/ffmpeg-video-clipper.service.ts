import * as crypto from "node:crypto";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import * as os from "node:os";
import * as path from "node:path";
import type {
	ClipCreationRequest,
	IFmpegVideoClipperService,
	LocalGeneratedClip,
} from "../interfaces/video-clipper.interface";

export class FFmpegVideoClipperService implements IFmpegVideoClipperService {
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
	}): Promise<{ success: boolean; clips: LocalGeneratedClip[] }> {
		const tmpDir = os.tmpdir();
		const clips: LocalGeneratedClip[] = [];

		for (const [_index, request] of requests.entries()) {
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
