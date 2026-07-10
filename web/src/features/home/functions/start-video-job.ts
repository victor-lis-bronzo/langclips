import { createServerFn } from "@tanstack/react-start";
import { JobStartSchema } from "../schemas/job-start-schema";
import { apiServer } from "#/lib/axios/server";

export type JobType = {
  jobId: string;
};

export const startVideoJob = createServerFn({ method: "POST" })
  .validator(JobStartSchema)
  .handler(async ({ data }): Promise<JobType & { message: string }> => {
    console.log("Sending job request with fileKey:", data.fileKey);
    
    const { data: job } = await apiServer.post("videos/process", {
      fileKey: data.fileKey,
    });

    return job;
  });
