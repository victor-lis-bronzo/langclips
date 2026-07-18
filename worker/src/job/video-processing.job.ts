import { Job } from "bullmq";
import path from "path";
import os from "os";
import { IStorageService } from "../interfaces/storage.interface";
import { IAudioExtractorService } from "../interfaces/audio-extractor.interface";
import { IDeckBuilderService } from "../interfaces/deck-builder.interface";
import { IDiskCleanupService } from "../interfaces/disk-cleanup.interface";
import { Deck } from "../types/deck.types";
import { ITranscriptionService } from "../interfaces/transcription.interface";
import {
  IVideoClipperService,
  LocalGeneratedClip,
} from "../interfaces/video-clipper.interface";
import { IClipUploaderService } from "../interfaces/clip-uploader.interface";

export class VideoProcessingJob {
  constructor(
    private readonly storageService: IStorageService,
    private readonly audioExtractor: IAudioExtractorService,
    private readonly transcriber: ITranscriptionService,
    private readonly videoClipper: IVideoClipperService,
    private readonly clipUploader: IClipUploaderService,
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
    let clips: LocalGeneratedClip[] = [];

    try {
      // Passo 1: Download do vídeo bruto do R2
      console.log(`[DOWNLOAD] Baixando ${fileKey}...`);
      await job.updateProgress({ step: "download", percentage: 5 });
      const { success: downloadSucess } = await this.storageService.download({
        fileKey,
        destinationPath: videoPath,
      });
      if (!downloadSucess) {
        throw new Error(`Falha ao baixar arquivo ${fileKey}`);
      }

      // Passo 2: Extração de áudio com FFmpeg
      console.log(`[FFMPEG] Extraindo áudio...`);
      await job.updateProgress({ step: "audio-extraction", percentage: 20 });
      const { outputPath, success: extractionSuccess, startOffset } =
        await this.audioExtractor.extract({
          videoPath,
          outputPath: audioPath,
        });
      if (!extractionSuccess) {
        throw new Error(`Falha ao extrair áudio do arquivo ${fileKey}`);
      }

      // Passo 3: Transcrição via Whisper (futuro)
      console.log(`[WHISPER] Transcrevendo áudio...`);
      await job.updateProgress({ step: "transcription", percentage: 40 });
      const { transcriptionData } = await this.transcriber.transcribe({
        audioPath,
      });
      console.log(`[WHISPER] Transcrição realizada com sucesso.`);

      const validRequests = transcriptionData.filter((data) => {
        const duration = data.end - data.start;
        return duration >= 2 && duration <= 20;
      });

      // Passo 4: Gera os cortes solicitados
      console.log(`[CLIPPER] Gerando cortes...`);
      await job.updateProgress({ step: "clip-generation", percentage: 60 });
      const { clips: localClips, success: clipsSuccess } =
        await this.videoClipper.generateClips({
          sourceFilePath: videoPath,
          requests: validRequests.map((data) => ({
            startTime: data.start + startOffset,
            endTime: data.end + startOffset,
            transcription: data.text,
          })),
        });
      clips = localClips;

      if (!clipsSuccess) {
        throw new Error(`Falha ao gerar cortes para o arquivo ${fileKey}`);
      }
      console.log(`[CLIPPER] Cortes gerados com sucesso.`);

      // Passo 5: Upload dos cortes gerados
      console.log(`[UPLOAD] Enviando cortes para o R2...`);
      await job.updateProgress({ step: "clip-upload", percentage: 75 });
      const uploadedClips = await this.clipUploader.upload(localClips);

      // Passo 6: Construir o Deck
      console.log(`[DECK] Construindo deck...`);
      await job.updateProgress({ step: "deck-construction", percentage: 85 });
      const deck = this.deckBuilder.build({
        jobId: job.id!,
        sourceFileKey: fileKey,
        uploadedClips,
      });

      // Passo 7: Upload do Deck (JSON) para o R2
      console.log(`[UPLOAD] Salvando deck no R2...`);
      await job.updateProgress({ step: "deck-upload", percentage: 95 });
      const deckKey = `decks/${deck.id}.json`;
      await this.storageService.upload({
        fileKey: deckKey,
        body: JSON.stringify(deck),
        contentType: "application/json",
      });

      console.log(`[FIM] Job ${job.id} concluído. Deck: ${deck.id}`);
      return { status: "success", deck };
    } finally {
      // Limpeza de disco local (sempre executa, mesmo com erro)
      console.log(`[CLEANUP] Limpando arquivos locais...`);
      const paths = [
        videoPath,
        audioPath,
        ...clips.map((clip) => clip.tempFilePath),
      ];
      await this.diskCleanup.cleanup({ paths });
      await this.storageService.delete({ fileKey });
    }
  }
}
