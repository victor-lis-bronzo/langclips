import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { DropFileInput } from "#/components/drop-file-input";
import { submitFileToR2 } from "../functions/submit-to-r2";
import { videoUploadSchema } from "../schemas/video-upload-schema";
import { UploadFileLoading } from "./upload-file-loading";

export function DropFileForm() {
	const navigate = useNavigate({ from: "/" });

	const form = useForm({
		defaultValues: {
			videoFile: undefined as unknown as File,
		},
		validators: {
			onChange: videoUploadSchema,
		},
		onSubmit: async ({ value }) => {
			const formData = new FormData();
			formData.append("file", value.videoFile);

			const response = await submitFileToR2({
				data: formData,
			});

			if (response.success) {
				navigate({
					to: "/processing/$jobId",
					params: { jobId: response.jobId },
				});
			}
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
			<form.Subscribe
				selector={(state) => [state.isSubmitting]}
				children={([isSubmitting]) => {
					if (isSubmitting) {
						return <UploadFileLoading />;
					}

					return (
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
					);
				}}
			/>
		</form>
	);
}
