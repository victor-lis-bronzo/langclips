import { unlink } from "fs/promises";
import type { IDiskCleanupService } from "../interfaces/disk-cleanup.interface";

export class LocalDiskCleanupService implements IDiskCleanupService {
	async cleanup({ paths }: { paths: string[] }): Promise<void> {
		await Promise.allSettled(paths.map((filePath) => unlink(filePath)));
	}
}
