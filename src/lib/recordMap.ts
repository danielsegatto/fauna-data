import type { CollectionPoint, FaunaGroup, FaunaRecord } from "@/lib/types";

export interface RecordMapPin {
  recordId: string;
  collectionPointId: string;
  collectionPointName: string;
  species: string;
  group: FaunaGroup;
  timestamp: number;
  latitude: number;
  longitude: number;
  /** Whether the pin coordinates came from the record itself or its collection point. */
  pinSource: "record" | "collectionPoint";
}

export interface CollectionPointMapPin {
  collectionPointId: string;
  name: string;
  group: FaunaGroup;
  latitude: number;
  longitude: number;
  recordCount: number;
}

interface BuildRecordMapPinsOptions {
  group?: FaunaGroup | "all";
  collectionPointId?: string;
  startDate?: number;
  endDate?: number;
}

export interface RecordMapPinsResult {
  totalRecords: number;
  mappableRecords: number;
  unmappableRecords: number;
  pins: RecordMapPin[];
  collectionPointPins: CollectionPointMapPin[];
}

function isValidCoordinate(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function buildCollectionPointPins(
  collectionPoints: CollectionPoint[],
  records: FaunaRecord[]
): CollectionPointMapPin[] {
  const recordCountByPoint = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.collectionPointId] = (acc[record.collectionPointId] ?? 0) + 1;
    return acc;
  }, {});

  return collectionPoints
    .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
    .map((point) => ({
      collectionPointId: point.id,
      name: point.name,
      group: point.group,
      latitude: point.latitude as number,
      longitude: point.longitude as number,
      recordCount: recordCountByPoint[point.id] ?? 0,
    }));
}

export function buildRecordMapPins(
  records: FaunaRecord[],
  collectionPoints: CollectionPoint[],
  options: BuildRecordMapPinsOptions = {}
): RecordMapPinsResult {
  const pointById = collectionPoints.reduce<Record<string, CollectionPoint>>((acc, point) => {
    acc[point.id] = point;
    return acc;
  }, {});

  const filtered = records.filter((record) => {
    if (options.group && options.group !== "all" && record.group !== options.group) return false;
    if (options.collectionPointId && record.collectionPointId !== options.collectionPointId) return false;
    if (options.startDate && record.timestamp < options.startDate) return false;
    if (options.endDate && record.timestamp > options.endDate) return false;
    return true;
  });

  const pins: RecordMapPin[] = [];

  for (const record of filtered) {
    const point = pointById[record.collectionPointId];
    if (!point) continue;

    // Prefer the record's own coordinates; fall back to collection point coords.
    const hasRecordCoords = isValidCoordinate(record.latitude) && isValidCoordinate(record.longitude);
    const hasPointCoords = isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude);

    if (!hasRecordCoords && !hasPointCoords) continue;

    pins.push({
      recordId: record.id,
      collectionPointId: point.id,
      collectionPointName: point.name,
      species: record.data.species,
      group: record.group,
      timestamp: record.timestamp,
      latitude: hasRecordCoords ? (record.latitude as number) : (point.latitude as number),
      longitude: hasRecordCoords ? (record.longitude as number) : (point.longitude as number),
      pinSource: hasRecordCoords ? "record" : "collectionPoint",
    });
  }

  // Build CP pins filtered to the same scope (group + date range, not collectionPointId
  // because even single-point views may want the anchor marker shown).
  const scopedCollectionPoints = collectionPoints.filter((point) => {
    if (options.group && options.group !== "all" && point.group !== options.group) return false;
    return true;
  });

  const collectionPointPins = buildCollectionPointPins(scopedCollectionPoints, filtered);

  return {
    totalRecords: filtered.length,
    mappableRecords: pins.length,
    unmappableRecords: Math.max(filtered.length - pins.length, 0),
    pins,
    collectionPointPins,
  };
}
