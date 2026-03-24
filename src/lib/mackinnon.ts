export const MACKINNON_METHODOLOGY_ID = "mackinnon";
export const MACKINNON_LIMIT_OPTIONS = [10, 15, 20] as const;

export function isMackinnonMethodology(methodology?: string): boolean {
  return methodology === MACKINNON_METHODOLOGY_ID;
}

export function parseMackinnonLimit(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;

  return parsed;
}

export function normalizeSpeciesName(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export function hasMackinnonPointReachedLimit(recordCount: number, limit?: number): boolean {
  return limit !== undefined && recordCount >= limit;
}