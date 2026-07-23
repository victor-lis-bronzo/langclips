import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { ClipMetadata, DeckRecord, Exercise } from "./indexed-db.types";

export interface LangClipsDB extends DBSchema {
	decks: {
		key: string;
		value: DeckRecord;
	};
	clips: {
		key: string;
		value: ClipMetadata;
	};
	exercises: {
		key: string;
		value: Exercise;
		indexes: {
			deckId: string;
			clipId: string;
		};
	};
}

const DB_NAME = "langclips-local";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<LangClipsDB>> | null = null;

/**
 * Obtém ou inicializa a conexão com o banco de dados IndexedDB
 */
export function getDatabase(): Promise<IDBPDatabase<LangClipsDB>> {
	if (dbPromise) return dbPromise;

	dbPromise = openDB<LangClipsDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains("decks")) {
				db.createObjectStore("decks", { keyPath: "id" });
			}
			if (!db.objectStoreNames.contains("clips")) {
				db.createObjectStore("clips", {
					keyPath: "id",
				});
			}
			if (!db.objectStoreNames.contains("exercises")) {
				const store = db.createObjectStore("exercises", { keyPath: "id" });
				store.createIndex("deckId", "deckId");
				store.createIndex("clipId", "clipId");
			}
		},
	});

	return dbPromise;
}
