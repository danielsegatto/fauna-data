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
type SpeciesQueryMatchStrength = "prefix" | "contains" | "none";

interface SpeciesQueryMatchResult {
  kind: SpeciesQueryMatchKind;
  strength: SpeciesQueryMatchStrength;
}

function normalizeQueryForMatching(value: string): string {
  return normalizeSpeciesSearch(value).replace(/\s+/g, " ").trim();
}

function getCandidateQueryMatchStrength(
  candidate: string,
  normalizedQuery: string
): SpeciesQueryMatchStrength {
  const normalizedCandidate = normalizeQueryForMatching(candidate);
  if (!normalizedCandidate || !normalizedQuery) return "none";

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  if (queryWords.length <= 1) {
    if (normalizedCandidate.startsWith(normalizedQuery)) {
      return "prefix";
    }

    return normalizedCandidate.includes(normalizedQuery) ? "contains" : "none";
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

    if (isMatch) {
      return start === 0 ? "prefix" : "contains";
    }
  }

  return "none";
}

function candidateMatchesQuery(candidate: string, normalizedQuery: string): boolean {
  return getCandidateQueryMatchStrength(candidate, normalizedQuery) !== "none";
}

function getPrimarySpeciesName(item: SpeciesCatalogItem): string {
  return item.taxonName || item.canonicalName;
}

function getSpeciesQueryMatchResult(
  item: SpeciesCatalogItem,
  query: string
): SpeciesQueryMatchResult {
  const normalizedQuery = normalizeQueryForMatching(query);
  if (!normalizedQuery) {
    return {
      kind: "primary",
      strength: "prefix",
    };
  }

  const primaryStrength = getCandidateQueryMatchStrength(
    getPrimarySpeciesName(item),
    normalizedQuery
  );
  if (primaryStrength !== "none") {
    return {
      kind: "primary",
      strength: primaryStrength,
    };
  }

  const alternateStrengths = [item.canonicalName, item.portugueseName]
    .map((name) => getCandidateQueryMatchStrength(name, normalizedQuery));

  if (alternateStrengths.includes("prefix")) {
    return {
      kind: "alternate",
      strength: "prefix",
    };
  }

  if (alternateStrengths.includes("contains")) {
    return {
      kind: "alternate",
      strength: "contains",
    };
  }

  return {
    kind: "none",
    strength: "none",
  };
}

export function getSpeciesQueryMatchKind(
  item: SpeciesCatalogItem,
  query: string
): SpeciesQueryMatchKind {
  return getSpeciesQueryMatchResult(item, query).kind;
}

export function getOrderedSpeciesAutocompleteMatches(
  species: SpeciesCatalogItem[],
  query: string,
  maxSuggestions?: number
): SpeciesCatalogItem[] {
  if (!query.trim()) return [];

  const primaryPrefixMatches: SpeciesCatalogItem[] = [];
  const alternatePrefixMatches: SpeciesCatalogItem[] = [];
  const primaryContainsMatches: SpeciesCatalogItem[] = [];
  const alternateContainsMatches: SpeciesCatalogItem[] = [];

  for (const item of species) {
    const match = getSpeciesQueryMatchResult(item, query);
    if (match.kind === "primary" && match.strength === "prefix") {
      primaryPrefixMatches.push(item);
    } else if (match.kind === "alternate" && match.strength === "prefix") {
      alternatePrefixMatches.push(item);
    } else if (match.kind === "primary" && match.strength === "contains") {
      primaryContainsMatches.push(item);
    } else if (match.kind === "alternate" && match.strength === "contains") {
      alternateContainsMatches.push(item);
    }
  }

  const ordered = [
    ...primaryPrefixMatches,
    ...alternatePrefixMatches,
    ...primaryContainsMatches,
    ...alternateContainsMatches,
  ];
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
