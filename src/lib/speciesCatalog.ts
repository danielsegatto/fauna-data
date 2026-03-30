import Papa from "papaparse";

export interface SpeciesCatalogItem {
  canonicalName: string;
  taxonName: string;
  portugueseName: string;
}

interface HeaderMap {
  canonicalKey?: string;
  taxonKey?: string;
  portugueseKey?: string;
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeSpeciesSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function detectHeaders(fields: string[]): HeaderMap {
  const withNormalized = fields.map((field) => ({
    original: field,
    normalized: normalizeHeader(field),
  }));

  const canonical = withNormalized.find(({ normalized }) => (
    normalized.includes("autoria")
    || normalized.includes("taxon com autoria")
  ));

  const portuguese = withNormalized.find(({ normalized }) => (
    normalized.includes("nome em portugues")
    || normalized.includes("nome portugues")
    || normalized === "portugues"
  ));

  const taxon = withNormalized.find(({ normalized }) => (
    (normalized.includes("nome do taxon") || normalized === "taxon")
    && !normalized.includes("autoria")
    && normalized !== (canonical?.normalized ?? "")
  ));

  return {
    canonicalKey: canonical?.original,
    taxonKey: taxon?.original,
    portugueseKey: portuguese?.original,
  };
}

function toItem(
  row: Record<string, string>,
  headers: HeaderMap,
  fallbackFields: string[]
): SpeciesCatalogItem | null {
  const canonicalName = (headers.canonicalKey
    ? row[headers.canonicalKey]
    : row[fallbackFields[1] ?? ""])?.trim() ?? "";

  const taxonName = (headers.taxonKey
    ? row[headers.taxonKey]
    : row[fallbackFields[2] ?? ""])?.trim() ?? "";

  const portugueseName = (headers.portugueseKey
    ? row[headers.portugueseKey]
    : row[fallbackFields[3] ?? ""])?.trim() ?? "";

  if (!canonicalName && !taxonName && !portugueseName) {
    return null;
  }

  return {
    canonicalName: canonicalName || taxonName,
    taxonName,
    portugueseName,
  };
}

export function parseSpeciesCatalog(csvText: string): SpeciesCatalogItem[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const rows = parsed.data ?? [];
  const fields = parsed.meta.fields ?? [];
  if (rows.length === 0 || fields.length === 0) return [];

  const headers = detectHeaders(fields);

  const unique = new Map<string, SpeciesCatalogItem>();
  for (const row of rows) {
    const item = toItem(row, headers, fields);
    if (!item) continue;

    const key = normalizeSpeciesSearch(
      `${item.canonicalName}|${item.taxonName}|${item.portugueseName}`
    );
    if (!key) continue;
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return Array.from(unique.values());
}

export function speciesMatchesQuery(item: SpeciesCatalogItem, query: string): boolean {
  const normalizedQuery = normalizeSpeciesSearch(query);
  if (!normalizedQuery) return true;

  return [item.canonicalName, item.taxonName, item.portugueseName]
    .map(normalizeSpeciesSearch)
    .some((name) => name.includes(normalizedQuery));
}
