import type { IDBPDatabase } from "idb";
import { getDatabase, type LangClipsDB } from "./indexed-db.provider";

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
