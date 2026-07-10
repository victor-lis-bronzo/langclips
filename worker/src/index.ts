import { Worker, JobState } from "bullmq";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

console.log({ redisConnection });

console.log("👷 Worker de processamento iniciado. Escutando a fila...");

const videoWorker = new Worker(
  "video-processing",
  async (job) => {
    console.log(
      `[INÍCIO] Recebi o job ${job.id} referente ao arquivo: ${job.data.fileKey}`,
    );

    // Passo 1: Informar o Redis que começamos
    const jobState: JobState = "active";
    await job.updateProgress(jobState);

    // As próximas etapas vão entrar aqui:
    // 1. Download do R2
    // 2. Extração com FFmpeg
    // 3. API do Whisper
    // 4. Limpeza de disco

    console.log(`[FIM] Job ${job.id} concluído.`);
    return { status: "success", file: job.data.fileKey };
  },
  { connection: redisConnection },
);

videoWorker.on("completed", (job) => {
  console.log(`✅ Sucesso total no job ${job.id}`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`❌ O job ${job?.id} falhou miseravelmente:`, err.message);
});
