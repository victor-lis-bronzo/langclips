import { Job } from "bullmq";

export type VideoProcessingJobType = Job<{
  fileKey: string;
}>;
