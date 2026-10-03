import os from "node:os";
import path from "node:path";
import type { IDiskCleanupService } from "../interfaces/disk-cleanup.interface";

export interface LifecycleJob {
  id?: string;
  attemptsMade: number;
  opts: {
    attempts?: number;
  };
}

export async function handleJobCompleted(
  job: LifecycleJob,
  diskCleanup: IDiskCleanupService,
): Promise<void> {
  const tmpDir = os.tmpdir();
  const videoPath = path.join(tmpDir, `${job.id}-video`);
  const audioPath = path.join(tmpDir, `${job.id}-audio.mp3`);

  try {
    await diskCleanup.cleanup({ paths: [videoPath, audioPath] });
    console.log(`[CLEANUP] Arquivos temporários do Job ${job.id} removidos.`);
  } catch (err) {
    console.error(`[CLEANUP ERROR] Falha ao limpar Job ${job.id}:`, err);
  }
}

export async function handleJobFailed(
  job: LifecycleJob | undefined,
  err: Error,
  diskCleanup: IDiskCleanupService,
): Promise<{ cleaned: boolean }> {
  console.error(
    `❌ Job ${job?.id} falhou na tentativa ${job?.attemptsMade}:`,
    err.message,
  );

  if (!job) {
    return { cleaned: false };
  }

  const maxAttempts = job.opts?.attempts || 1;
  if (job.attemptsMade >= maxAttempts) {
    console.log(
      `[CLEANUP] Falha definitiva. Limpando arquivos do Job ${job.id}`,
    );
    const tmpDir = os.tmpdir();
    const videoPath = path.join(tmpDir, `${job.id}-video`);
    const audioPath = path.join(tmpDir, `${job.id}-audio.mp3`);
    await diskCleanup.cleanup({ paths: [videoPath, audioPath] });
    return { cleaned: true };
  }

  console.log(
    `[RETRY] Arquivos retidos no disco para a próxima tentativa do Job ${job?.id}.`,
  );
  return { cleaned: false };
}
