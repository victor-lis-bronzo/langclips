import { useQuery } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";

type UseGetClipNextProps = {
  deckId: string;
  clipId: string;
};

const clipIndexDbRepository = new IndexedDbClipRepository();

export default function useGetClipNext({ deckId, clipId }: UseGetClipNextProps) {
  return useQuery({
    queryKey: ["clip", deckId, clipId],
    queryFn: () => clipIndexDbRepository.getNextClipById(deckId, clipId),
    enabled: !!clipId && !!deckId,
  });
}

