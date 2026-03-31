import Papa from "papaparse";

export interface SpeciesCatalogItem {
  canonicalName: string;
  taxonName: string;
  portugueseName: string;
}

export interface MatchSpan {
  start: number;
  end: number;
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
    || normalized.includes("nome cientifico com autoria")
  ));

  const portuguese = withNormalized.find(({ normalized }) => (
    normalized.includes("nome em portugues")
    || normalized.includes("nome portugues")
    || normalized.includes("nome comum")
    || normalized === "portugues"
    || normalized === "comum"
  ));

  const taxon = withNormalized.find(({ normalized }) => (
    (
      normalized.includes("nome do taxon")
      || normalized === "taxon"
      || normalized === "nome cientifico"
      || normalized === "scientific name"
    )
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
  const canonicalValue = (headers.canonicalKey
    ? row[headers.canonicalKey]
    : row[fallbackFields[1] ?? ""])?.trim() ?? "";

  const taxonValue = (headers.taxonKey
    ? row[headers.taxonKey]
    : row[fallbackFields[2] ?? ""])?.trim() ?? "";

  const portugueseName = (headers.portugueseKey
    ? row[headers.portugueseKey]
    : row[fallbackFields[3] ?? ""])?.trim() ?? "";

  const canonicalName = canonicalValue || taxonValue;
  const taxonName = taxonValue || canonicalValue;

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
  const firstLine = csvText.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.includes(";") ? ";" : ",";

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    delimiter,
    delimitersToGuess: [";", ",", "\t", "|"],
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

interface NormalizedCharMap {
  originalStart: number;
  originalEnd: number;
}

function buildNormalizedIndexMap(value: string): {
  normalizedValue: string;
  map: NormalizedCharMap[];
} {
  const chars = Array.from(value);
  const map: NormalizedCharMap[] = [];
  const normalizedParts: string[] = [];

  let originalOffset = 0;
  for (const char of chars) {
    const normalizedChar = normalizeSpeciesSearch(char);
    const charLength = char.length;

    if (normalizedChar) {
      normalizedParts.push(normalizedChar);
      for (let i = 0; i < normalizedChar.length; i += 1) {
        map.push({
          originalStart: originalOffset,
          originalEnd: originalOffset + charLength,
        });
      }
    }

    originalOffset += charLength;
  }

  return {
    normalizedValue: normalizedParts.join(""),
    map,
  };
}

export function findMatchSpans(text: string, query: string): MatchSpan[] {
  const normalizedQuery = normalizeSpeciesSearch(query);
  if (!text || !normalizedQuery) return [];

  const { normalizedValue, map } = buildNormalizedIndexMap(text);
  if (!normalizedValue) return [];

  const spans: MatchSpan[] = [];
  let searchFrom = 0;

  while (searchFrom <= normalizedValue.length - normalizedQuery.length) {
    const startIndex = normalizedValue.indexOf(normalizedQuery, searchFrom);
    if (startIndex === -1) break;

    const endIndex = startIndex + normalizedQuery.length - 1;
    const startMap = map[startIndex];
    const endMap = map[endIndex];

    if (startMap && endMap) {
      spans.push({
        start: startMap.originalStart,
        end: endMap.originalEnd,
      });
    }

    searchFrom = startIndex + normalizedQuery.length;
  }

  return spans;
}
