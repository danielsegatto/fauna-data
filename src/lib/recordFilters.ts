import type { FaunaGroup, FaunaRecord } from "@/lib/types";

export interface RecordFilterOptions {
  group?: FaunaGroup | "all" | "";
  collectionPointId?: string;
  startDate?: number;
  endDate?: number;
}

export interface ExportFilters {
  group: string;
  collectionPointId: string;
  startDate: string;
  endDate: string;
}

export function filterRecordsByOptions(
  records: FaunaRecord[],
  options: RecordFilterOptions
): FaunaRecord[] {
  return records.filter((record) => {
    if (options.group && options.group !== "all" && record.group !== options.group) {
      return false;
    }
    if (options.collectionPointId && record.collectionPointId !== options.collectionPointId) {
      return false;
    }
    if (options.startDate && record.timestamp < options.startDate) {
      return false;
    }
    if (options.endDate && record.timestamp > options.endDate) {
      return false;
    }
    return true;
  });
}

export function exportFiltersToRecordFilters(
  filters: ExportFilters
): RecordFilterOptions {
  const options: RecordFilterOptions = {
    group: filters.group as RecordFilterOptions["group"],
    collectionPointId: filters.collectionPointId,
  };

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    options.startDate = start.getTime();
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    options.endDate = end.getTime();
  }

  return options;
}