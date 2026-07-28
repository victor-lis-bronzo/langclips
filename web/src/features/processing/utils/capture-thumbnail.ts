/**
 * Generates a JPEG thumbnail Blob from a video Blob by capturing the first frame (0.1s).
 */
export async function captureThumbnailFromBlob(
	videoBlob: Blob,
	_mimeType?: string,
): Promise<Blob | undefined> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return undefined;
	}

	return new Promise((resolve) => {
		const video = document.createElement("video");
		const url = URL.createObjectURL(videoBlob);

		video.src = url;
		video.currentTime = 0.1;
		video.muted = true;
		video.playsInline = true;

		const cleanup = () => {
			URL.revokeObjectURL(url);
			video.removeAttribute("src");
			video.load();
		};

		video.onloadeddata = () => {
			try {
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth || 320;
				canvas.height = video.videoHeight || 180;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					cleanup();
					resolve(undefined);
					return;
				}
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob(
					(blob) => {
						cleanup();
						resolve(blob ?? undefined);
					},
					"image/jpeg",
					0.8,
				);
			} catch (err) {
				console.error("Error drawing thumbnail canvas:", err);
				cleanup();
				resolve(undefined);
			}
		};

		video.onerror = (err) => {
			console.error("Error loading video for thumbnail generation:", err);
			cleanup();
			resolve(undefined);
		};
	});
}
