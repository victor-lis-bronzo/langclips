import { useForm } from "@tanstack/react-form";
import { DropFileInput } from "#/components/drop-file-input";
import { videoUploadSchema } from "../schemas/video-upload-schema";
import { submitFileToR2 } from "../functions/submit-to-r2";

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
      const formData = new FormData();
      formData.append("file", value.videoFile);

      const response = await submitFileToR2({
        data: formData,
      });

      console.log({ response });
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
