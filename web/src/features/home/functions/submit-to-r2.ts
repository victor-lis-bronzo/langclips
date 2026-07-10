import { createServerFn } from "@tanstack/react-start";
import { apiServer } from "#/lib/axios/server";
import { startVideoJob } from "./start-video-job";

export const submitFileToR2 = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid request data: expected FormData");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const file = data.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("No file found in the request");
    }

    console.log("Server received file:", file.name, file.type, file.size);

    const { data: response } = await apiServer.post<{ uploadUrl: string }>(
      "uploads/generate-presigned-url",
      {
        filename: file.name,
        contentType: file.type,
      },
    );

    console.log("Generated presigned URL response:", response);

    const arrayBuffer = await file.arrayBuffer();
    const r2Response = await fetch(response.uploadUrl, {
      method: "PUT",
      body: arrayBuffer,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!r2Response.ok) {
      const errorText = await r2Response.text();
      console.error("R2 Upload Error:", errorText);
      throw new Error(
        `Failed to upload file to storage: ${r2Response.statusText}`,
      );
    }

    console.log("R2 upload successful");

    const fileKey = file.name;

    const { jobId } = await startVideoJob({
      data: {
        fileKey,
      },
    });

    return { success: true, jobId };
  });
