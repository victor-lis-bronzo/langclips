import { Job } from "bullmq";
import path from "path";
import os from "os";
import { IStorageService } from "../interfaces/storage.interface";
import { IAudioExtractorService } from "../interfaces/audio-extractor.interface";
import { IDeckBuilderService } from "../interfaces/deck-builder.interface";
import { IDiskCleanupService } from "../interfaces/disk-cleanup.interface";
import { Deck } from "../types/deck.types";
import { ITranscriptionService } from "../interfaces/transcription.interface";

export class VideoProcessingJob {
  constructor(
    private readonly storageService: IStorageService,
    private readonly audioExtractor: IAudioExtractorService,
    private readonly transcriber: ITranscriptionService,
    private readonly deckBuilder: IDeckBuilderService,
    private readonly diskCleanup: IDiskCleanupService,
  ) {}

  async execute({
    job,
  }: {
    job: Job;
  }): Promise<{ status: string; deck: Deck }> {
    const { fileKey } = job.data;
    const tmpDir = os.tmpdir();

    const videoPath = path.join(tmpDir, `${job.id}-video`);
    const audioPath = path.join(tmpDir, `${job.id}-audio.mp3`);

    try {
      // Passo 1: Download do vídeo bruto do R2
      console.log(`[DOWNLOAD] Baixando ${fileKey}...`);
      await job.updateProgress(10);
      const { success: downloadSucess } = await this.storageService.download({
        fileKey,
        destinationPath: videoPath,
      });
      if (!downloadSucess) {
        throw new Error(`Falha ao baixar arquivo ${fileKey}`);
      }
      await job.updateProgress(25);

      // Passo 2: Extração de áudio com FFmpeg
      console.log(`[FFMPEG] Extraindo áudio...`);
      const { outputPath, success: extractionSuccess } =
        await this.audioExtractor.extract({
          videoPath,
          outputPath: audioPath,
        });
      if (!extractionSuccess) {
        throw new Error(`Falha ao extrair áudio do arquivo ${fileKey}`);
      }
      await job.updateProgress(50);

      // Passo 3: Transcrição via Whisper (futuro)
      // TODO: Injetar ITranscriptionService e chamar aqui
      const { transcriptionData } = await this.transcriber.transcribe({
        audioPath,
      });
      console.log(`[WHISPER] Transcrição realizada com sucesso.`);
      await job.updateProgress(70);

      // Passo 4: Construir o Deck
      console.log(`[DECK] Construindo deck...`);
      const deck = this.deckBuilder.build({
        title: fileKey,
        sourceFileKey: fileKey,
        transcriptionData,
      });
      await job.updateProgress(85);

      // Passo 5: Upload do Deck (JSON) para o R2
      console.log(`[UPLOAD] Salvando deck no R2...`);
      const deckKey = `decks/${deck.id}.json`;
      await this.storageService.upload({
        fileKey: deckKey,
        body: JSON.stringify(deck),
        contentType: "application/json",
      });
      await job.updateProgress(90);

      // Passo 6: Deletar vídeo original do R2 (BR03)
      console.log(`[CLEANUP] Deletando vídeo original ${fileKey} do R2...`);
      await this.storageService.delete({ fileKey });
      await job.updateProgress(100);

      console.log(`[FIM] Job ${job.id} concluído. Deck: ${deck.id}`);
      return { status: "success", deck };
    } finally {
      // Limpeza de disco local (sempre executa, mesmo com erro)
      console.log(`[CLEANUP] Limpando arquivos locais...`);
      const paths = [videoPath, audioPath];
      await this.diskCleanup.cleanup({ paths });
      await this.storageService.delete({ fileKey });
    }
  }
}
