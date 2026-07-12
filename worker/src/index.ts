import "./config/env"; // Carrega dotenv + validação Zod — DEVE ser o primeiro import

import { Worker } from "bullmq";
import { env } from "./config/env";
import { redisConnection } from "./config/redis";
import { s3Client } from "./config/s3-client";

import { R2StorageService } from "./services/r2-storage.service";
import { FFmpegAudioExtractorService } from "./services/ffmpeg-audio-extractor.service";
import { DeckBuilderService } from "./services/deck-builder.service";
import { LocalDiskCleanupService } from "./services/local-disk-cleanup.service";
import { VideoProcessingJob } from "./job/video-processing.job";
import { VideoProcessingJobType } from "./types/job.types";

// --- Composition Root: monta as dependências ---
const storageService = new R2StorageService(s3Client, env.STORAGE_BUCKET_NAME);
const audioExtractor = new FFmpegAudioExtractorService();
const deckBuilder = new DeckBuilderService();
const diskCleanup = new LocalDiskCleanupService();
const videoJob = new VideoProcessingJob(
  storageService,
  audioExtractor,
  deckBuilder,
  diskCleanup,
);

console.log("👷 Worker de processamento iniciado. Escutando a fila...");

const videoWorker = new Worker(
  "video-processing",
  async (job: VideoProcessingJobType) => {
    console.log(`[INÍCIO] Job ${job.id} — arquivo: ${job.data.fileKey}`);
    return videoJob.execute({ job });
  },
  { connection: redisConnection },
);

videoWorker.on("completed", (job) => {
  console.log(`✅ Sucesso no job ${job.id}`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err.message);
});
