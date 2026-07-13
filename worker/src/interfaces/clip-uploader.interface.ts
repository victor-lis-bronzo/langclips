import { Clip } from "../types/deck.types";
import { LocalGeneratedClip } from "./video-clipper.interface";

export interface IClipUploaderService {
  /**
   * Recebe uma lista de clipes gerados no disco local, faz o upload para o Storage (R2),
   * e retorna os objetos de domínio finalizados prontos para a montagem do Deck.
   */
  upload(localClips: LocalGeneratedClip[]): Promise<Clip[]>;
}
