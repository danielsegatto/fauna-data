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
  const normalizedQuery = normalizeQueryForMatching(query);
  if (!normalizedQuery) return true;

  return [item.canonicalName, item.taxonName, item.portugueseName]
    .some((name) => candidateMatchesQuery(name, normalizedQuery));
}

export type SpeciesQueryMatchKind = "primary" | "alternate" | "none";

function normalizeQueryForMatching(value: string): string {
  return normalizeSpeciesSearch(value).replace(/\s+/g, " ").trim();
}

function candidateMatchesQuery(candidate: string, normalizedQuery: string): boolean {
  const normalizedCandidate = normalizeQueryForMatching(candidate);
  if (!normalizedCandidate || !normalizedQuery) return false;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  if (queryWords.length <= 1) {
    return normalizedCandidate.includes(normalizedQuery);
  }

  const candidateWords = normalizedCandidate.split(" ").filter(Boolean);
  const windowSize = queryWords.length;

  for (let start = 0; start <= candidateWords.length - windowSize; start += 1) {
    let isMatch = true;

    for (let offset = 0; offset < windowSize; offset += 1) {
      const queryWord = queryWords[offset] ?? "";
      const candidateWord = candidateWords[start + offset] ?? "";

      if (!candidateWord.startsWith(queryWord)) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) return true;
  }

  return false;
}

function getPrimarySpeciesName(item: SpeciesCatalogItem): string {
  return item.taxonName || item.canonicalName;
}

export function getSpeciesQueryMatchKind(
  item: SpeciesCatalogItem,
  query: string
): SpeciesQueryMatchKind {
  const normalizedQuery = normalizeQueryForMatching(query);
  if (!normalizedQuery) return "primary";

  if (candidateMatchesQuery(getPrimarySpeciesName(item), normalizedQuery)) {
    return "primary";
  }

  const alternateNames = [item.canonicalName, item.portugueseName];

  if (alternateNames.some((name) => candidateMatchesQuery(name, normalizedQuery))) {
    return "alternate";
  }

  return "none";
}

export function getOrderedSpeciesAutocompleteMatches(
  species: SpeciesCatalogItem[],
  query: string,
  maxSuggestions?: number
): SpeciesCatalogItem[] {
  if (!query.trim()) return [];

  const primaryMatches: SpeciesCatalogItem[] = [];
  const alternateMatches: SpeciesCatalogItem[] = [];

  for (const item of species) {
    const kind = getSpeciesQueryMatchKind(item, query);
    if (kind === "primary") {
      primaryMatches.push(item);
    } else if (kind === "alternate") {
      alternateMatches.push(item);
    }
  }

  const ordered = [...primaryMatches, ...alternateMatches];
  if (typeof maxSuggestions === "number") {
    return ordered.slice(0, maxSuggestions);
  }

  return ordered;
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
    // Normalize per-character without trimming so spaces are preserved in the map.
    // normalizeSpeciesSearch uses .trim() which turns a lone space into ""; we
    // inline the same steps minus trim so word boundaries survive.
    const normalizedChar = char
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
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
  const normalizedQuery = normalizeQueryForMatching(query);
  if (!text || !normalizedQuery) return [];

  const { normalizedValue, map } = buildNormalizedIndexMap(text);
  if (!normalizedValue) return [];

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  if (queryWords.length > 1) {
    const normalizedWords = Array.from(normalizedValue.matchAll(/\S+/g)).map((match) => ({
      value: match[0],
      start: match.index ?? 0,
    }));

    const windowSize = queryWords.length;
    for (let start = 0; start <= normalizedWords.length - windowSize; start += 1) {
      let isMatch = true;
      const spans: MatchSpan[] = [];

      for (let offset = 0; offset < windowSize; offset += 1) {
        const queryWord = queryWords[offset] ?? "";
        const candidateWord = normalizedWords[start + offset];

        if (!candidateWord || !candidateWord.value.startsWith(queryWord)) {
          isMatch = false;
          break;
        }

        const startIndex = candidateWord.start;
        const endIndex = startIndex + queryWord.length - 1;
        const startMap = map[startIndex];
        const endMap = map[endIndex];

        if (startMap && endMap) {
          spans.push({
            start: startMap.originalStart,
            end: endMap.originalEnd,
          });
        }
      }

      if (isMatch && spans.length > 0) {
        return spans;
      }
    }

    return [];
  }

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
