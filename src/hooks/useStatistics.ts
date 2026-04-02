import { useMemo } from "react";
import { useRecords } from "./useRecords";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  ENVIRONMENT_OPTIONS,
  ACTIVITY_OPTIONS,
  type FaunaRecord,
} from "@/lib/types";

export type TimeRange = "all" | "7days" | "30days";

export interface SpeciesStat {
  name: string;
  count: number;
  avgQuantity: number;
}

export interface LabelValue {
  label: string;
  value: number;
}

export interface Statistics {
  totalRecords: number;
  uniqueSpecies: number;
  avgQuantity: number;
  maxQuantity: number;
  byGroup: LabelValue[];
  byMethodology: LabelValue[];
  byIdentification: LabelValue[];
  byEnvironment: LabelValue[];
  byActivity: LabelValue[];
  topSpecies: SpeciesStat[];
  byDate: LabelValue[];
}

const ID_LABELS: Record<string, string> = {
  A: "Auditivo",
  V: "Visual",
  AV: "Aud. + Visual",
};

const ENVIRONMENT_LABELS = new Map(
  ENVIRONMENT_OPTIONS.map((option) => [option.value.toLocaleLowerCase("pt-BR"), option.label])
);

const ACTIVITY_LABELS = new Map(
  ACTIVITY_OPTIONS.map((option) => [option.value.toLocaleLowerCase("pt-BR"), option.label])
);

function capitalizeFirst(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return `${trimmed.charAt(0).toLocaleUpperCase("pt-BR")}${trimmed.slice(1)}`;
}

function applyTimeRange(records: FaunaRecord[], range: TimeRange): FaunaRecord[] {
  if (range === "all") return records;
  const now = Date.now();
  const days = range === "7days" ? 7 : 30;
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return records.filter((r) => r.timestamp >= cutoff);
}

function countBy(records: FaunaRecord[], key: (r: FaunaRecord) => string): LabelValue[] {
  const map: Record<string, number> = {};
  records.forEach((r) => {
    const k = key(r);
    map[k] = (map[k] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function countByNormalized(
  records: FaunaRecord[],
  key: (r: FaunaRecord) => string,
  resolveLabel: (trimmed: string, normalized: string) => string
): LabelValue[] {
  const map = new Map<string, LabelValue>();

  records.forEach((r) => {
    const trimmed = key(r).trim();
    if (!trimmed) return;

    const normalized = trimmed.toLocaleLowerCase("pt-BR");
    const existing = map.get(normalized);

    if (existing) {
      existing.value += 1;
      return;
    }

    map.set(normalized, {
      label: resolveLabel(trimmed, normalized),
      value: 1,
    });
  });

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export function useStatistics(range: TimeRange = "all"): Statistics {
  const { records } = useRecords();

  return useMemo(() => {
    const filtered = applyTimeRange(records, range);

    if (filtered.length === 0) {
      return {
        totalRecords: 0,
        uniqueSpecies: 0,
        avgQuantity: 0,
        maxQuantity: 0,
        byGroup: [],
        byMethodology: [],
        byIdentification: [],
        byEnvironment: [],
        byActivity: [],
        topSpecies: [],
        byDate: [],
      };
    }

    // Basic counts
    const totalRecords = filtered.length;
    const uniqueSpecies = new Set(filtered.map((r) => r.data.species)).size;
    const quantities = filtered.map((r) => r.data.quantity);
    const avgQuantity =
      Math.round((quantities.reduce((a, b) => a + b, 0) / quantities.length) * 10) / 10;
    const maxQuantity = Math.max(...quantities);

    // By group
    const byGroup = countBy(filtered, (r) => GROUP_LABELS[r.group] ?? r.group);

    // By methodology (top 6)
    const byMethodology = countBy(
      filtered,
      (r) => METHODOLOGY_LABELS[r.methodology] ?? r.methodology
    ).slice(0, 6);

    // By identification
    const byIdentification = countBy(
      filtered,
      (r) => ID_LABELS[r.data.identification] ?? r.data.identification
    );

    // By environment
    const byEnvironment = countByNormalized(
      filtered,
      (r) => r.data.environment,
      (trimmed, normalized) => ENVIRONMENT_LABELS.get(normalized) ?? capitalizeFirst(trimmed)
    );

    // By activity
    const byActivity = countByNormalized(
      filtered,
      (r) => r.data.activity,
      (trimmed, normalized) => ACTIVITY_LABELS.get(normalized) ?? capitalizeFirst(trimmed)
    );

    // Top 10 species
    const speciesMap = new Map<string, { count: number; totalQty: number }>();
    filtered.forEach((r) => {
      const s = r.data.species;
      const prev = speciesMap.get(s) ?? { count: 0, totalQty: 0 };
      speciesMap.set(s, { count: prev.count + 1, totalQty: prev.totalQty + r.data.quantity });
    });
    const topSpecies: SpeciesStat[] = Array.from(speciesMap.entries())
      .map(([name, { count, totalQty }]) => ({
        name,
        count,
        avgQuantity: Math.round((totalQty / count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By date (last 14 days for "all", otherwise full range)
    const dateMap: Record<string, number> = {};
    filtered.forEach((r) => {
      const d = new Date(r.timestamp).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      dateMap[d] = (dateMap[d] ?? 0) + 1;
    });
    const byDate = Object.entries(dateMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => {
        const [da, ma] = a.label.split("/").map(Number);
        const [db, mb] = b.label.split("/").map(Number);
        return ma !== mb ? ma - mb : da - db;
      })
      .slice(-14);

    return {
      totalRecords,
      uniqueSpecies,
      avgQuantity,
      maxQuantity,
      byGroup,
      byMethodology,
      byIdentification,
      byEnvironment,
      byActivity,
      topSpecies,
      byDate,
    };
  }, [records, range]);
}
