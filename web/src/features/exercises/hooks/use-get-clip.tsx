import { useQuery } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";

type UseGetClipProps = {
	deckId: string;
	clipId: string;
};

export default function useGetClip({
	deckId,
	clipId,
}: UseGetClipProps) {
	const clipIndexDbRepository = new IndexedDbClipRepository();

	return useQuery({
		queryKey: ["clip", deckId, clipId],
		queryFn: () => clipIndexDbRepository.getClipById(deckId, clipId),
		enabled: !!deckId && !!clipId,
	});
}
