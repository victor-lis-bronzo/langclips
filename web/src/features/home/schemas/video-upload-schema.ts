import z from "zod";

export const videoUploadSchema = z.object({
	videoFile: z
		.instanceof(File, {
			message: "Você precisa selecionar um arquivo de vídeo.",
		})
		.refine(
			(file) => file.size <= 100 * 1024 * 1024,
			"O vídeo excede o limite estrito de 100MB.",
		)
		.refine(
			(file) => ["video/mp4", "video/quicktime"].includes(file.type),
			"Formato inválido. Envie apenas MP4 ou MOV.",
		),
});
