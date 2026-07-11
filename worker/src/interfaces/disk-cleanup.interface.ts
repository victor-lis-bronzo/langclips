export interface IDiskCleanupService {
  /**
   * Remove um ou mais arquivos temporários do disco.
   */
  cleanup(params: { paths: string[] }): Promise<void>;
}
