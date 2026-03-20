import { useMemo } from "react";
import { useRecords } from "./useRecords";
import type { FaunaRecord } from "@/lib/types";

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

const GROUP_LABELS: Record<string, string> = {
  birds: "Aves",
  mammals: "Mamíferos",
  herpetofauna: "Herpetofauna",
};

const METHODOLOGY_LABELS: Record<string, string> = {
  "point-count": "Ponto de Escuta",
  transect: "Transecto",
  "mist-net": "Redes de Neblina",
  mackinnon: "Lista de Mackinnon",
  "free-observation": "Obs. Livre",
  "camera-trap": "Arm. Fotográfica",
  "track-station": "Est. Pegadas",
  "live-trap": "Arm. Gaiola",
  "visual-search": "Busca Visual",
  pitfall: "Arm. Queda",
  acoustic: "Acústico",
};

const ID_LABELS: Record<string, string> = {
  A: "Auditivo",
  V: "Visual",
  AV: "Aud. + Visual",
};

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
    const byEnvironment = countBy(filtered, (r) => r.data.environment);

    // By activity
    const byActivity = countBy(filtered, (r) => r.data.activity);

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
