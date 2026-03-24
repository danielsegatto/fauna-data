import Dexie, { type Table } from "dexie";
import type { FaunaRecord, CollectionPoint } from "./types";

/**
 * FaunaDB — local database using IndexedDB via Dexie.
 *
 * Two tables:
 *   - records          : every fauna observation
 *   - collectionPoints : GPS-named survey points
 *
 * IndexedDB persists across sessions, works fully offline,
 * and handles thousands of records without performance issues.
 */
class FaunaDB extends Dexie {
  records!: Table<FaunaRecord, string>;
  collectionPoints!: Table<CollectionPoint, string>;

  constructor() {
    super("fauna-data");

    this.version(1).stores({
      // Indexed fields (for filtering/sorting). Non-indexed fields are still stored.
      records: "id, group, methodology, collectionPointId, timestamp",
      collectionPoints: "id, group, methodology, createdAt",
    });

    this.version(2).stores({
      records: "id, group, methodology, collectionPointId, timestamp",
      collectionPoints: "id, group, methodology, createdAt",
    });
  }
}

export const db = new FaunaDB();
