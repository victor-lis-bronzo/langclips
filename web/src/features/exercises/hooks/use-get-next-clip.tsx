import { useQuery } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";

type UseGetClipNextProps = {
  clipId: string;
};

export default function useGetClipNext({ clipId }: UseGetClipNextProps) {
  const clipIndexDbRepository = new IndexedDbClipRepository();

  return useQuery({
    queryKey: ["clip", clipId],
    queryFn: () => clipIndexDbRepository.getNextClip(clipId),
    enabled: !!clipId,
  });
}
