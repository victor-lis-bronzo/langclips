import { getDatabase, type LangClipsDB } from "./indexed-db.provider";
import type { IDBPDatabase } from "idb";

export abstract class BaseIndexedDbRepository {
	constructor(
		protected readonly dbProvider: () => Promise<
			IDBPDatabase<LangClipsDB>
		> = getDatabase,
	) {}

	protected getDb(): Promise<IDBPDatabase<LangClipsDB>> {
		return this.dbProvider();
	}
}
