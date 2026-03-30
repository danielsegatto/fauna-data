import { useCallback, useState } from "react";
import { formatDate, formatTime } from "@/lib/format";
import {
  exportFiltersToRecordFilters,
  filterRecordsByOptions,
  type ExportFilters,
} from "@/lib/recordFilters";
import {
  normalizeSpeciesSearch,
  parseSpeciesCatalog,
  type SpeciesCatalogItem,
} from "@/lib/speciesCatalog";
import { GROUP_LABELS, METHODOLOGY_LABELS, type FaunaRecord } from "@/lib/types";

const SPECIES_CSV_PATH = "/data/species-catalog.csv";

let speciesCatalogCache: SpeciesCatalogItem[] | null = null;
let speciesCatalogPromise: Promise<SpeciesCatalogItem[]> | null = null;

function escapeCsv(value: string | number): string {
  const str = String(value);
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function loadSpeciesCatalog(): Promise<SpeciesCatalogItem[]> {
  if (speciesCatalogCache) return speciesCatalogCache;
  if (speciesCatalogPromise) return speciesCatalogPromise;

  speciesCatalogPromise = fetch(SPECIES_CSV_PATH)
    .then(async (response) => {
      if (!response.ok) return [];
      const csv = await response.text();
      const parsed = parseSpeciesCatalog(csv);
      speciesCatalogCache = parsed;
      return parsed;
    })
    .catch(() => [])
    .finally(() => {
      speciesCatalogPromise = null;
    });

  return speciesCatalogPromise;
}

function buildSpeciesLookup(items: SpeciesCatalogItem[]): Map<string, SpeciesCatalogItem> {
  const lookup = new Map<string, SpeciesCatalogItem>();

  for (const item of items) {
    const keys = [item.canonicalName, item.taxonName, item.portugueseName]
      .map((value) => normalizeSpeciesSearch(value))
      .filter(Boolean);

    keys.forEach((key) => {
      if (!lookup.has(key)) {
        lookup.set(key, item);
      }
    });
  }

  return lookup;
}

function resolveSpeciesColumns(
  species: string,
  lookup: Map<string, SpeciesCatalogItem>
): { colB: string; colC: string; colD: string } {
  const normalized = normalizeSpeciesSearch(species);
  const matched = lookup.get(normalized);

  if (!matched) {
    return {
      colB: "",
      colC: species,
      colD: "",
    };
  }

  return {
    colB: matched.canonicalName,
    colC: matched.taxonName || matched.canonicalName,
    colD: matched.portugueseName,
  };
}

function buildCSV(
  records: FaunaRecord[],
  pointMap: Record<string, string>,
  speciesLookup: Map<string, SpeciesCatalogItem>
): string {
  const headers = [
    "ID",
    "Grupo",
    "Metodologia",
    "Data",
    "Hora",
    "Nome do táxon (com autoria)",
    "Nome do táxon",
    "Nome em Português",
    "Espécie (registro)",
    "Identificação",
    "Ambiente",
    "Estrato",
    "Atividade",
    "Quantidade",
    "Distância (m)",
    "Lado",
    "Ponto de Coleta",
    "Observações",
  ];

  const rows = records.map((r) => {
    const date = formatDate(r.timestamp);
    const time = formatTime(r.timestamp, { includeSeconds: true });
    const speciesColumns = resolveSpeciesColumns(r.data.species, speciesLookup);

    return [
      r.id,
      GROUP_LABELS[r.group] ?? r.group,
      METHODOLOGY_LABELS[r.methodology] ?? r.methodology,
      date,
      time,
      speciesColumns.colB,
      speciesColumns.colC,
      speciesColumns.colD,
      r.data.species,
      r.data.identification,
      r.data.environment,
      r.data.stratum,
      r.data.activity,
      r.data.quantity,
      r.data.distance,
      r.data.side,
      pointMap[r.collectionPointId] ?? r.collectionPointId,
      r.data.observations,
    ]
      .map(escapeCsv)
      .join(",");
  });

  return [headers.map(escapeCsv).join(","), ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType }); // BOM for Excel UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const filterRecords = useCallback(
    (records: FaunaRecord[], filters: ExportFilters): FaunaRecord[] => {
      return filterRecordsByOptions(records, exportFiltersToRecordFilters(filters));
    },
    []
  );

  const exportCSV = useCallback(
    async (
      records: FaunaRecord[],
      filters: ExportFilters,
      pointMap: Record<string, string>
    ): Promise<number> => {
      setIsExporting(true);
      try {
        const filtered = filterRecords(records, filters);
        if (filtered.length === 0) return 0;

        const speciesCatalog = await loadSpeciesCatalog();
        const speciesLookup = buildSpeciesLookup(speciesCatalog);
        const csv = buildCSV(filtered, pointMap, speciesLookup);
        const timestamp = new Date()
          .toISOString()
          .slice(0, 16)
          .replace("T", "_")
          .replace(":", "-");
        downloadFile(csv, `fauna-data_${timestamp}.csv`, "text/csv;charset=utf-8;");
        return filtered.length;
      } finally {
        setIsExporting(false);
      }
    },
    [filterRecords]
  );

  return { isExporting, exportCSV, filterRecords };
}
