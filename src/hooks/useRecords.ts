import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { generateId } from "@/lib/id";
import { normalizeSpeciesName } from "@/lib/mackinnon";
import { filterRecordsByOptions } from "@/lib/recordFilters";
import type { FaunaRecord, FaunaGroup } from "@/lib/types";

/**
 * useRecords
 *
 * All create / read / update / delete operations for fauna records.
 * Uses Dexie's useLiveQuery so any component that calls this hook
 * re-renders automatically whenever the underlying data changes.
 */
export function useRecords() {
  // ─── Live queries ─────────────────────────────────────────────────────────

  /** All records, newest first */
  const records = useLiveQuery(
    () => db.records.orderBy("timestamp").reverse().toArray(),
    [],
    [] as FaunaRecord[]
  );

  const isLoading = records === undefined;

  // ─── Write operations ─────────────────────────────────────────────────────

  /**
   * Save a new fauna record.
   * Assigns a unique ID and timestamp automatically.
   */
  async function saveRecord(
    data: Omit<FaunaRecord, "id" | "timestamp">
  ): Promise<FaunaRecord> {
    const record: FaunaRecord = {
      ...data,
      id: generateId(),
      timestamp: Date.now(),
    };
    await db.records.add(record);
    return record;
  }

  /**
   * Update specific fields of an existing record.
   */
  async function updateRecord(
    id: string,
    changes: Partial<Omit<FaunaRecord, "id">>
  ): Promise<void> {
    await db.records.update(id, changes);
  }

  /**
   * Delete a single record by ID.
   */
  async function deleteRecord(id: string): Promise<void> {
    await db.records.delete(id);
  }

  /**
   * Delete all records. Used for data reset.
   */
  async function clearAllRecords(): Promise<void> {
    await db.records.clear();
  }

  // ─── Read helpers ──────────────────────────────────────────────────────────

  /**
   * Get a single record by ID (one-time read, not reactive).
   */
  async function getRecordById(id: string): Promise<FaunaRecord | undefined> {
    return db.records.get(id);
  }

  /**
   * Filter records client-side by group and/or date range.
   * Since the full list is already loaded reactively, filtering
   * in JS is fast and avoids extra DB queries.
   */
  function filterRecords(options: {
    group?: FaunaGroup | "all";
    startDate?: number;
    endDate?: number;
    collectionPointId?: string;
  }): FaunaRecord[] {
    return filterRecordsByOptions(records ?? [], options);
  }

  function hasSpeciesRecordedAtPoint(options: {
    collectionPointId: string;
    species: string;
    excludeRecordId?: string;
  }): boolean {
    const normalizedSpecies = normalizeSpeciesName(options.species);
    if (!normalizedSpecies) return false;

    return (records ?? []).some((record) => {
      if (record.collectionPointId !== options.collectionPointId) return false;
      if (options.excludeRecordId && record.id === options.excludeRecordId) return false;
      return normalizeSpeciesName(record.data.species) === normalizedSpecies;
    });
  }

  return {
    records: records ?? [],
    isLoading,
    saveRecord,
    updateRecord,
    deleteRecord,
    clearAllRecords,
    getRecordById,
    filterRecords,
    hasSpeciesRecordedAtPoint,
  };
}
