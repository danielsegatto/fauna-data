import { useEffect, useState } from "react";
import {
  parseSpeciesCatalog,
  type SpeciesCatalogItem,
} from "@/lib/speciesCatalog";
import type { FaunaGroup } from "@/lib/types";

const GROUP_SPECIES_CSV_PATH: Record<FaunaGroup, string> = {
  birds: "/data/species-catalog-birds.csv",
  mammals: "/data/species-catalog-mammals.csv",
  herpetofauna: "/data/species-catalog-herpetofauna.csv",
};

const catalogCache = new Map<string, SpeciesCatalogItem[]>();
const catalogPromise = new Map<string, Promise<SpeciesCatalogItem[]>>();

async function loadCatalogFromPath(path: string): Promise<SpeciesCatalogItem[]> {
  const cacheKey = `path:${path}`;
  const cached = catalogCache.get(cacheKey);
  if (cached) return cached;

  const pending = catalogPromise.get(cacheKey);
  if (pending) return pending;

  const loadPromise = fetch(path)
    .then(async (response) => {
      const parsed = response.ok
        ? parseSpeciesCatalog(await response.text())
        : [];
      catalogCache.set(cacheKey, parsed);
      return parsed;
    })
    .catch(() => {
      catalogCache.set(cacheKey, []);
      return [];
    })
    .finally(() => {
      catalogPromise.delete(cacheKey);
    });

  catalogPromise.set(cacheKey, loadPromise);
  return loadPromise;
}

async function loadSpeciesCatalog(group: FaunaGroup): Promise<SpeciesCatalogItem[]> {
  const variant = `group:${group}`;

  const cached = catalogCache.get(variant);
  if (cached) return cached;

  const pending = catalogPromise.get(variant);
  if (pending) return pending;

  const loadPromise = (async () => {
    const path = GROUP_SPECIES_CSV_PATH[group];
    const catalog = await loadCatalogFromPath(path);
    catalogCache.set(variant, catalog);
    return catalog;
  })().finally(() => {
    catalogPromise.delete(variant);
  });

  catalogPromise.set(variant, loadPromise);
  return loadPromise;
}

export function useSpeciesCatalog(group: FaunaGroup) {
  const variant = `group:${group}`;
  const [species, setSpecies] = useState<SpeciesCatalogItem[]>(catalogCache.get(variant) ?? []);
  const [isLoading, setIsLoading] = useState(!catalogCache.get(variant));

  useEffect(() => {
    let cancelled = false;

    loadSpeciesCatalog(group).then((items) => {
      if (cancelled) return;
      setSpecies(items);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [group]);

  return { species, isLoading };
}
