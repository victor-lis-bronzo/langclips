import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

const deckRepository = new IndexedDbStorageRepository();

export function useGetAllDecks() {
	return useQuery({
		queryKey: ["decks"],
		queryFn: () => deckRepository.getAllDecks(),
	});
}
