import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ENVIRONMENT_OPTIONS, type SelectOption } from "@/lib/types";

const PRESET_VALUES = new Set(ENVIRONMENT_OPTIONS.map((o) => o.value.toLocaleLowerCase()));

/**
 * useEnvironmentOptions
 *
 * Returns a merged list of environment options:
 *   1. Predefined presets from ENVIRONMENT_OPTIONS (always present)
 *   2. Custom values typed by the user and saved in any record, deduplicated
 *      case-insensitively against presets and each other.
 *
 * Custom options appear after the predefined ones, sorted alphabetically.
 * The list updates reactively whenever records change (Dexie live query).
 */
export function useEnvironmentOptions(): SelectOption[] {
  const customOptions = useLiveQuery<SelectOption[]>(
    async () => {
      const records = await db.records.toArray();

      const seen = new Set<string>(PRESET_VALUES);
      const custom: SelectOption[] = [];

      for (const record of records) {
        const raw = record.data.environment?.trim();
        if (!raw) continue;

        const key = raw.toLocaleLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        custom.push({ label: raw, value: raw });
      }

      custom.sort((a, b) => a.label.localeCompare(b.label));
      return custom;
    },
    []
  );

  return [...ENVIRONMENT_OPTIONS, ...(customOptions ?? [])];
}
