import { useQuery } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";

type UseGetClipBlobProps = {
	deckId: string;
	clipId: string;
};

const clipIndexDbRepository = new IndexedDbClipRepository();

export default function useGetClipBlob({
	deckId,
	clipId,
}: UseGetClipBlobProps) {
	return useQuery({
		queryKey: ["clip-blob", deckId, clipId],
		queryFn: () => clipIndexDbRepository.getClipBlobById(clipId),
		enabled: !!deckId && !!clipId && typeof window !== "undefined",
		staleTime: Number.POSITIVE_INFINITY,
	});
}
