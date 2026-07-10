import { z } from "zod";

export const JobStartSchema = z.object({
  fileKey: z.string().min(1, "File key is required"),
});
