import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { DropFileInput } from "#/components/drop-file-input";

const videoUploadSchema = z.object({
  videoFile: z
    .instanceof(File, {
      message: "Você precisa selecionar um arquivo de vídeo.",
    })
    .refine(
      (file) => file.size <= 50 * 1024 * 1024,
      "O vídeo excede o limite estrito de 50MB.",
    )
    .refine(
      (file) => ["video/mp4", "video/quicktime"].includes(file.type),
      "Formato inválido. Envie apenas MP4 ou MOV.",
    ),
});

export function DropFileForm() {
  const form = useForm({
    defaultValues: {
      videoFile: undefined as unknown as File,
    },
    validators: {
      onChange: videoUploadSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Arquivo pronto para upload:", value.videoFile.name);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="videoFile"
        children={(field) => (
          <DropFileInput
            name="videoFile"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                field.handleChange(file);
                form.handleSubmit();
              }
            }}
          />
        )}
      />
    </form>
  );
}
