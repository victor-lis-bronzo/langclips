import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

type useGetDeckByIdProps = {
	deckId: string;
};

const deckIndexDbRepository = new IndexedDbStorageRepository();

export default function useGetDeckById({ deckId }: useGetDeckByIdProps) {
	return useQuery({
		queryKey: ["deck", deckId],
		queryFn: () => deckIndexDbRepository.getDeck(deckId),
	});
}

