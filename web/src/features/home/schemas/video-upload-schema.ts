import z from "zod";

export const videoUploadSchema = z.object({
	videoFile: z
		.instanceof(File, {
			message: "You must select a video file.",
		})
		.refine(
			(file) => file.size <= 100 * 1024 * 1024,
			"The video exceeds the strict 100MB limit.",
		)
		.refine(
			(file) => ["video/mp4", "video/quicktime"].includes(file.type),
			"Invalid format. Please upload MP4 or MOV files only.",
		),
});
