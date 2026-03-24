import { useCallback, useState } from "react";
import { formatDate, formatTime } from "@/lib/format";
import {
  exportFiltersToRecordFilters,
  filterRecordsByOptions,
  type ExportFilters,
} from "@/lib/recordFilters";
import { GROUP_LABELS, METHODOLOGY_LABELS, type FaunaRecord } from "@/lib/types";

function escapeCsv(value: string | number): string {
  const str = String(value);
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSV(
  records: FaunaRecord[],
  pointMap: Record<string, string>
): string {
  const headers = [
    "ID",
    "Grupo",
    "Metodologia",
    "Data",
    "Hora",
    "Espécie",
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
    return [
      r.id,
      GROUP_LABELS[r.group] ?? r.group,
      METHODOLOGY_LABELS[r.methodology] ?? r.methodology,
      date,
      time,
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

        const csv = buildCSV(filtered, pointMap);
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
