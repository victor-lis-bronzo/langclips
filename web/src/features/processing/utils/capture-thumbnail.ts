/**
 * Generates a JPEG thumbnail Blob from a video Blob by capturing a frame.
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

		video.preload = "auto";
		video.muted = true;
		video.playsInline = true;
		video.src = url;

		let isCleanedUp = false;
		const cleanup = () => {
			if (isCleanedUp) return;
			isCleanedUp = true;
			URL.revokeObjectURL(url);
			video.removeAttribute("src");
			video.load();
		};

		const timeoutId = setTimeout(() => {
			cleanup();
			resolve(undefined);
		}, 5000);

		const drawFrame = () => {
			try {
				const width = video.videoWidth || 320;
				const height = video.videoHeight || 180;
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					clearTimeout(timeoutId);
					cleanup();
					resolve(undefined);
					return;
				}
				ctx.drawImage(video, 0, 0, width, height);
				canvas.toBlob(
					(blob) => {
						clearTimeout(timeoutId);
						cleanup();
						resolve(blob ?? undefined);
					},
					"image/jpeg",
					0.8,
				);
			} catch (err) {
				console.error("Error drawing thumbnail canvas:", err);
				clearTimeout(timeoutId);
				cleanup();
				resolve(undefined);
			}
		};

		video.onloadedmetadata = () => {
			const seekTime = Math.min(
				0.2,
				video.duration > 0 ? video.duration / 2 : 0.1,
			);
			video.currentTime = seekTime;
		};

		video.onseeked = () => {
			drawFrame();
		};

		video.onerror = (err) => {
			console.error("Error loading video for thumbnail generation:", err);
			clearTimeout(timeoutId);
			cleanup();
			resolve(undefined);
		};
	});
}
