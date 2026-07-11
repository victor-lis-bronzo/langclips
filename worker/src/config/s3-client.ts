import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3Client = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT,
  forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
  },
});
