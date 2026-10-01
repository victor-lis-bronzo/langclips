/**
 * Duração aceitável de um Clip, em segundos. O mínimo é compartilhado entre a
 * segmentação da transcrição e o filtro do job: se divergirem, frases curtas
 * são descartadas em silêncio.
 */
export const MIN_CLIP_DURATION_SECONDS = 1.5;
export const MAX_CLIP_DURATION_SECONDS = 20;
