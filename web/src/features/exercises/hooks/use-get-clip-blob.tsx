import { useQuery } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";

type UseGetClipBlobProps = {
	deckId: string;
	clipId: string;
};

export default function useGetClipBlob({
	deckId,
	clipId,
}: UseGetClipBlobProps) {
	const clipIndexDbRepository = new IndexedDbClipRepository();

	return useQuery({
		queryKey: ["clip-blob", deckId, clipId],
		queryFn: () => clipIndexDbRepository.getClipBlobById(deckId, clipId),
		enabled: !!deckId && !!clipId,
	});
}
