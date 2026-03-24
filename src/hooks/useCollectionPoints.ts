import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { generateId } from "@/lib/id";
import type { CollectionPoint, FaunaGroup } from "@/lib/types";

/**
 * useCollectionPoints
 *
 * All create / read / update / delete operations for collection points.
 * A collection point is a named GPS location tied to a specific
 * group + methodology survey session.
 */
export function useCollectionPoints() {
  // ─── Live queries ─────────────────────────────────────────────────────────

  /** All collection points, newest first */
  const collectionPoints = useLiveQuery(
    () => db.collectionPoints.orderBy("createdAt").reverse().toArray(),
    [],
    [] as CollectionPoint[]
  );

  const isLoading = collectionPoints === undefined;

  // ─── Write operations ─────────────────────────────────────────────────────

  /**
   * Create a new collection point.
   * Assigns a unique ID and createdAt timestamp automatically.
   */
  async function saveCollectionPoint(
    data: Omit<CollectionPoint, "id" | "createdAt">
  ): Promise<CollectionPoint> {
    const point: CollectionPoint = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    await db.collectionPoints.add(point);
    return point;
  }

  /**
   * Update specific fields of an existing collection point.
   */
  async function updateCollectionPoint(
    id: string,
    changes: Partial<Omit<CollectionPoint, "id">>
  ): Promise<void> {
    await db.collectionPoints.update(id, changes);
  }

  /**
   * Delete a collection point by ID.
   * Note: associated records are NOT deleted — they keep the collectionPointId
   * as a historical reference.
   */
  async function deleteCollectionPoint(id: string): Promise<void> {
    await db.collectionPoints.delete(id);
  }

  // ─── Read helpers ──────────────────────────────────────────────────────────

  /**
   * Get a single collection point by ID (one-time read, not reactive).
   */
  async function getCollectionPointById(
    id: string
  ): Promise<CollectionPoint | undefined> {
    return db.collectionPoints.get(id);
  }

  /**
   * Filter collection points by group and/or methodology.
   */
  function filterCollectionPoints(options: {
    group?: FaunaGroup | "all";
    methodology?: string;
  }): CollectionPoint[] {
    return (collectionPoints ?? []).filter((p) => {
      if (options.group && options.group !== "all" && p.group !== options.group)
        return false;
      if (options.methodology && p.methodology !== options.methodology)
        return false;
      return true;
    });
  }

  /**
   * Build a quick lookup map: id → name.
   * Useful for displaying point names in record lists without
   * doing a DB query per record.
   */
  function getCollectionPointMap(): Record<string, string> {
    return (collectionPoints ?? []).reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});
  }

  return {
    collectionPoints: collectionPoints ?? [],
    isLoading,
    saveCollectionPoint,
    updateCollectionPoint,
    deleteCollectionPoint,
    getCollectionPointById,
    filterCollectionPoints,
    getCollectionPointMap,
  };
}
