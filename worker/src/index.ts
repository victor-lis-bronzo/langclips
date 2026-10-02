import "./config/env"; // Carrega dotenv + validação Zod — DEVE ser o primeiro import

import { Worker } from "bullmq";
import { env } from "./config/env";
import { redisConnection } from "./config/redis";
import { s3Client } from "./config/s3-client";
import { VideoProcessingJob } from "./job/video-processing.job";
import { ClipUploaderService } from "./services/clip-uploader.service";
import { DeckBuilderService } from "./services/deck-builder.service";
import { FFmpegAudioChunkerService } from "./services/ffmpeg-audio-chunker.service";
import { FFmpegAudioExtractorService } from "./services/ffmpeg-audio-extractor.service";
import { FFmpegVideoClipperService } from "./services/ffmpeg-video-clipper.service";
import { LocalDiskCleanupService } from "./services/local-disk-cleanup.service";
import { R2StorageService } from "./services/r2-storage.service";
import { WhisperTranscriptionService } from "./services/whisper-transcription.service";
import type { VideoProcessingJobType } from "./types/job.types";

import os from "node:os";
import path from "node:path";

const storageService = new R2StorageService(s3Client, env.STORAGE_BUCKET_NAME);
const audioExtractor = new FFmpegAudioExtractorService();
const audioChunker = new FFmpegAudioChunkerService();
const whisperTranscriber = new WhisperTranscriptionService(
  env.GROQ_API_KEY,
  audioChunker,
);
const videoClipper = new FFmpegVideoClipperService();
const deckBuilder = new DeckBuilderService();
const clipUploader = new ClipUploaderService(storageService);
const diskCleanup = new LocalDiskCleanupService();
const videoJob = new VideoProcessingJob(
  storageService,
  audioExtractor,
  whisperTranscriber,
  videoClipper,
  clipUploader,
  deckBuilder,
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

videoWorker.on("completed", async (job) => {
  console.log(`✅ Sucesso no job ${job.id}`);

  const tmpDir = os.tmpdir();
  const videoPath = path.join(tmpDir, `${job.id}-video`);
  const audioPath = path.join(tmpDir, `${job.id}-audio.mp3`);

  try {
    await diskCleanup.cleanup({ paths: [videoPath, audioPath] });
    console.log(`[CLEANUP] Arquivos temporários do Job ${job.id} removidos.`);
  } catch (err) {
    console.error(`[CLEANUP ERROR] Falha ao limpar Job ${job.id}:`, err);
  }
});

videoWorker.on("failed", async (job, err) => {
  console.error(
    `❌ Job ${job?.id} falhou na tentativa ${job?.attemptsMade}:`,
    err.message,
  );

  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    console.log(
      `[CLEANUP] Falha definitiva. Limpando arquivos do Job ${job.id}`,
    );
    const tmpDir = os.tmpdir();
    const videoPath = path.join(tmpDir, `${job.id}-video`);
    const audioPath = path.join(tmpDir, `${job.id}-audio.mp3`);
    await diskCleanup.cleanup({ paths: [videoPath, audioPath] });
  } else {
    console.log(
      `[RETRY] Arquivos retidos no disco para a próxima tentativa do Job ${job?.id}.`,
    );
  }
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`🛑 Recebido ${signal}, encerrando worker...`);
  await videoWorker.close();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
