export interface IStorageService {
  /**
   * Faz download de um arquivo do storage remoto para o disco local.
   */
  download(params: { fileKey: string; destinationPath: string }): Promise<void>;

  /**
   * Faz upload de um conteúdo para o storage remoto.
   */
  upload(params: {
    fileKey: string;
    body: Buffer | string;
    contentType: string;
  }): Promise<void>;

  /**
   * Deleta um arquivo do storage remoto.
   */
  delete(params: { fileKey: string }): Promise<void>;
}
