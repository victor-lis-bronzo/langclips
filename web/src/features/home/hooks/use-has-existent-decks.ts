import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

const storageRepository = new IndexedDbStorageRepository();

export function useHasExistentDecks() {
	return useQuery({
		queryKey: ["has-existent-deck"],
		queryFn: () =>
			storageRepository.getAllDecks().then((decks) => decks.length > 0),
	});
}
