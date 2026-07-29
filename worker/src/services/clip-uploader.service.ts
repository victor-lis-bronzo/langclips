import crypto from "node:crypto";
import fs from "node:fs/promises";
import type { IClipUploaderService } from "../interfaces/clip-uploader.interface";
import type { IStorageService } from "../interfaces/storage.interface";
import type { LocalGeneratedClip } from "../interfaces/video-clipper.interface";
import type { Clip } from "../types/deck.types";

export class ClipUploaderService implements IClipUploaderService {
	constructor(private readonly storageService: IStorageService) {}

	async upload(localClips: LocalGeneratedClip[]): Promise<Clip[]> {
		const finalClips: Clip[] = [];

		for (const localClip of localClips) {
			const fileId = crypto.randomUUID();
			const cloudKey = `clips/${fileId}.mp4`;

			try {
				const fileBuffer = await fs.readFile(localClip.tempFilePath);

				await this.storageService.upload({
					fileKey: cloudKey,
					body: fileBuffer,
					contentType: "video/mp4",
				});

				finalClips.push({
					id: localClip.id,
					sourceFileKey: cloudKey,
					transcription: localClip.transcription,
					startTime: localClip.startTime,
					endTime: localClip.endTime,
				});
			} catch (error) {
				throw new Error(
					`[ClipUploader] Falha ao enviar o clip ${localClip.id} para o Storage. Motivo: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}

		return finalClips;
	}
}
