import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

type UseGetClipBlobProps = {
	deckId: string;
	clipId: string;
};

export default function useGetClipBlob({
	deckId,
	clipId,
}: UseGetClipBlobProps) {
	const deckIndexDbRepository = new IndexedDbStorageRepository();

	return useQuery({
		queryKey: ["clip-blob", deckId, clipId],
		queryFn: () => deckIndexDbRepository.getClipBlobById(deckId, clipId),
		enabled: !!deckId && !!clipId,
	});
}
