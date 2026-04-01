import type { CollectionPoint } from "@/lib/types";

/**
 * Builds a map of collection point IDs to names for quick lookup.
 */
export function buildCollectionPointMap(
  points: CollectionPoint[]
): Record<string, string> {
  return points.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {});
}

/**
 * Generates filtered collection point options for select dropdowns.
 * Prepends an "all" option.
 */
export function buildCollectionPointOptions(
  points: CollectionPoint[],
  allLabel: string = "Todos os pontos"
) {
  return [
    { label: allLabel, value: "" },
    ...points.map((p) => ({ label: p.name, value: p.id })),
  ];
}

/**
 * Filters collection points by group, then optionally generates select options.
 */
export function filterAndMapCollectionPoints(
  points: CollectionPoint[],
  groupFilter?: string,
  options?: { allLabel?: string; mapOnly?: boolean }
) {
  const filtered = groupFilter
    ? points.filter((p) => p.group === groupFilter)
    : points;

  if (options?.mapOnly) {
    return {
      points: filtered,
      map: buildCollectionPointMap(filtered),
    };
  }

  return {
    points: filtered,
    options: buildCollectionPointOptions(filtered, options?.allLabel),
    map: buildCollectionPointMap(filtered),
  };
}
