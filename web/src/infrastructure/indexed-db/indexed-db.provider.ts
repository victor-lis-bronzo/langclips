import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { DeckRecord, ClipRecord } from "./indexed-db.types";

export interface LangClipsDB extends DBSchema {
  decks: {
    key: string;
    value: DeckRecord;
  };
  clips: {
    key: string;
    value: ClipRecord;
    indexes: { "by-deck": string };
  };
}

const DB_NAME = "langclips-local";
const DB_VERSION = 1;

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
        const clipStore = db.createObjectStore("clips", {
          keyPath: "sourceFileKey",
        });
        clipStore.createIndex("by-deck", "deckId");
      }
    },
  });

  return dbPromise;
}
