import { BaseIndexedDbRepository } from "#/infrastructure/database/base-indexed-db.repository";
import type { DeckRecord } from "#/infrastructure/database/indexed-db.types";
import type { IDeckStorageRepository } from "./deck.repository.interface";

export class IndexedDbStorageRepository
	extends BaseIndexedDbRepository
	implements IDeckStorageRepository
{
	async saveDeck(deck: DeckRecord): Promise<void> {
		const db = await this.getDb();
		await db.put("decks", deck);
	}

	async getDeck(deckId: string): Promise<DeckRecord | null> {
		const db = await this.getDb();
		const deck = await db.get("decks", deckId);
		return deck || null;
	}

	async getAllDecks(): Promise<DeckRecord[]> {
		const db = await this.getDb();
		return db.getAll("decks");
	}

	async deleteDeck(deckId: string): Promise<void> {
		const db = await this.getDb();
		await db.delete("decks", deckId);
	}

	async cleanUp(): Promise<void> {
		const db = await this.getDb();
		await db.clear("decks");
	}
}
