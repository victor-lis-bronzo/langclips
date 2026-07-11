import { Job } from "bullmq";
import path from "path";
import os from "os";
import { IStorageService } from "../interfaces/storage.interface";
import { IAudioExtractorService } from "../interfaces/audio-extractor.interface";
import { IDeckBuilderService } from "../interfaces/deck-builder.interface";
import { IDiskCleanupService } from "../interfaces/disk-cleanup.interface";
import { Deck } from "../types/deck.types";

export class VideoProcessingJob {
  constructor(
    private readonly storageService: IStorageService,
    private readonly audioExtractor: IAudioExtractorService,
    private readonly deckBuilder: IDeckBuilderService,
    private readonly diskCleanup: IDiskCleanupService,
  ) {}

  async execute({ job }: { job: Job }): Promise<{ status: string; deck: Deck }> {
    const { fileKey } = job.data;
    const tmpDir = os.tmpdir();
    console.log({ tmpDir })

    const videoPath = path.join(tmpDir, `${job.id}-video`);
    const audioPath = path.join(tmpDir, `${job.id}-audio.mp3`);

    try {
      // Passo 1: Download do vídeo bruto do R2
      console.log(`[DOWNLOAD] Baixando ${fileKey}...`);
      await job.updateProgress(10);
      await this.storageService.download({ fileKey, destinationPath: videoPath });
      await job.updateProgress(25);

      // Passo 2: Extração de áudio com FFmpeg
      console.log(`[FFMPEG] Extraindo áudio...`);
      await this.audioExtractor.extract({ videoPath, outputPath: audioPath });
      await job.updateProgress(50);

      // Passo 3: Transcrição via Whisper (futuro)
      // TODO: Injetar ITranscriptionService e chamar aqui
      // const transcription = await this.transcriber.transcribe({ audioPath });
      console.log(`[WHISPER] Transcrição pendente de implementação...`);
      await job.updateProgress(70);

      // Passo 4: Construir o Deck
      console.log(`[DECK] Construindo deck...`);
      // Exemplo de transcrição mockada para simular geração de clips e aplicar BR01
      const mockTranscription = [
        {
          text: "Hello everyone, welcome back to another video.",
          start: 1,
          end: 7, // 6s - Válido (BR01)
          words: [
            { word: "Hello", start: 1, end: 2 },
            { word: "everyone", start: 2, end: 3 },
            { word: "welcome", start: 3, end: 4 },
            { word: "back", start: 4, end: 5 },
            { word: "to", start: 5, end: 5.5 },
            { word: "another", start: 5.5, end: 6 },
            { word: "video", start: 6, end: 7 },
          ],
        },
        {
          text: "Short text.",
          start: 8,
          end: 9.5, // 1.5s - Inválido (BR01)
          words: [
            { word: "Short", start: 8, end: 9 },
            { word: "text", start: 9, end: 9.5 },
          ],
        },
        {
          text: "Today we are going to practice English in a very engaging way using movies.",
          start: 10,
          end: 18, // 8s - Válido (BR01)
          words: [
            { word: "Today", start: 10, end: 11 },
            { word: "we", start: 11, end: 11.5 },
            { word: "are", start: 11.5, end: 12 },
            { word: "going", start: 12, end: 13 },
            { word: "to", start: 13, end: 13.5 },
            { word: "practice", start: 13.5, end: 14.5 },
            { word: "English", start: 14.5, end: 15.5 },
            { word: "in", start: 15.5, end: 16 },
            { word: "a", start: 16, end: 16.2 },
            { word: "very", start: 16.2, end: 16.8 },
            { word: "engaging", start: 16.8, end: 17.5 },
            { word: "way", start: 17.5, end: 17.8 },
            { word: "using", start: 17.8, end: 18 },
          ],
        },
      ];

      const deck = this.deckBuilder.build({
        title: fileKey,
        sourceFileKey: fileKey,
        transcriptionData: mockTranscription,
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
      await this.diskCleanup.cleanup({ paths: [videoPath, audioPath] });
    }
  }
}
