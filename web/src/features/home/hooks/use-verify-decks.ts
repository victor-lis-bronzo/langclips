import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

const storageRepository = new IndexedDbStorageRepository();

export function useVerifyExistentDecks() {
	return useQuery({
		queryKey: ["verify-deck-data"],
		queryFn: () =>
			storageRepository.getAllDecks().then((decks) => {
				if (decks.length === 0) {
					return null;
				}
				return decks[0];
			}),
	});
}
