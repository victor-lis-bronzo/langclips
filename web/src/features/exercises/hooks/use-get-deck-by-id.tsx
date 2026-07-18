import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

type useGetDeckByIdProps = {
	deckId: string;
};

export default function useGetDeckById({ deckId }: useGetDeckByIdProps) {
	const deckIndexDbRepository = new IndexedDbStorageRepository();

	return useQuery({
		queryKey: ["deck", deckId],
		queryFn: () => deckIndexDbRepository.getDeck(deckId),
	});
}
