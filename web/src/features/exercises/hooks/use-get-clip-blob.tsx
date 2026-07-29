import { useQuery } from "@tanstack/react-query";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";

type UseGetClipBlobProps = {
	deckId: string;
	clipId: string;
	retry?: number | boolean;
	retryDelay?: number | ((failureCount: number, error: Error) => number);
};

const clipIndexDbRepository = new IndexedDbClipRepository();

export default function useGetClipBlob({
	deckId,
	clipId,
	retry = 5,
	retryDelay = (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
}: UseGetClipBlobProps) {
	return useQuery({
		queryKey: ["clip-blob", deckId, clipId],
		queryFn: async () => {
			const blob = await clipIndexDbRepository.getClipBlobById(clipId);
			if (!blob) {
				throw new Error(`Clip blob not found for clipId: ${clipId}`);
			}
			return blob;
		},
		enabled: !!deckId && !!clipId && typeof window !== "undefined",
		staleTime: 5_000,
		retry,
		retryDelay,
	});
}
