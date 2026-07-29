import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { ClipMetadata, DeckRecord, Exercise, StoredClipRecord } from "./indexed-db.types";

export interface LangClipsDB extends DBSchema {
	decks: {
		key: string;
		value: DeckRecord;
	};
	clips: {
		key: string;
		value: StoredClipRecord;
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
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<LangClipsDB>> | null = null;

export function handleDbUpgrade(
	db: IDBPDatabase<LangClipsDB>,
	oldVersion: number,
	_newVersion: number | null,
) {
	if (oldVersion < 1) {
		if (!db.objectStoreNames.contains("decks")) {
			db.createObjectStore("decks", { keyPath: "id" });
		}
		if (!db.objectStoreNames.contains("exercises")) {
			const store = db.createObjectStore("exercises", { keyPath: "id" });
			store.createIndex("deckId", "deckId");
			store.createIndex("clipId", "clipId");
		}
	}

	// Migração v2 -> v3 ou fresh install onde "clips" não existia no schema legado
	if (oldVersion < 3) {
		if (!db.objectStoreNames.contains("clips")) {
			db.createObjectStore("clips", {
				keyPath: "id",
			});
		}
	}

	// Fallback de segurança para garantir integridade dos stores
	if (!db.objectStoreNames.contains("decks")) {
		db.createObjectStore("decks", { keyPath: "id" });
	}
	if (!db.objectStoreNames.contains("clips")) {
		db.createObjectStore("clips", { keyPath: "id" });
	}
	if (!db.objectStoreNames.contains("exercises")) {
		const store = db.createObjectStore("exercises", { keyPath: "id" });
		store.createIndex("deckId", "deckId");
		store.createIndex("clipId", "clipId");
	}
}

/**
 * Obtém ou inicializa a conexão com o banco de dados IndexedDB
 */
export function getDatabase(): Promise<IDBPDatabase<LangClipsDB>> {
	if (dbPromise) return dbPromise;

	dbPromise = openDB<LangClipsDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion, newVersion) {
			handleDbUpgrade(db, oldVersion, newVersion);
		},
	});

	return dbPromise;
}
