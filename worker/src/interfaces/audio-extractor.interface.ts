export interface IAudioExtractorService {
  /**
   * Extrai o áudio de um arquivo de vídeo e salva como arquivo separado.
   */
  extract(params: {
    videoPath: string;
    outputPath: string;
  }): Promise<{ outputPath: string }>;
}
