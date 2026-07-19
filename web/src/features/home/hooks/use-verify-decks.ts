import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";

export function useVerifyExistentDecks() {
  const storageRepository = new IndexedDbStorageRepository();

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
