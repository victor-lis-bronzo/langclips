import { useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export function useAcknowledgeDownload() {
  /**
   * Notifica a API que o download local do Deck e seus Clips foi realizado com sucesso,
   * permitindo que o backend remova os arquivos associados do R2.
   *
   * @param fileKeys Lista de chaves (s3 keys) a serem excluídas.
   */
  const acknowledge = useCallback(async (fileKeys: string[]): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/videos/acknowledge-download`, {
        fileKeys,
      });
      console.log("[Acknowledge] Cleanup do R2 solicitado com sucesso.");
    } catch (error) {
      console.error(
        "[Acknowledge] Falha ao enviar notificação de download para a API:",
        error,
      );
      // Não lançamos o erro para não interromper a experiência do usuário,
      // já que a persistência local foi concluída com sucesso.
    }
  }, []);

  return { acknowledge };
}
