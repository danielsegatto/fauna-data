import { useEffect, useState } from "react";
import { parseSpeciesCatalog, type SpeciesCatalogItem } from "@/lib/speciesCatalog";

const SPECIES_CSV_PATH = "/data/species-catalog.csv";

let catalogCache: SpeciesCatalogItem[] | null = null;
let catalogPromise: Promise<SpeciesCatalogItem[]> | null = null;

async function loadSpeciesCatalog(): Promise<SpeciesCatalogItem[]> {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = fetch(SPECIES_CSV_PATH)
    .then(async (response) => {
      if (!response.ok) return [];
      const csv = await response.text();
      const parsed = parseSpeciesCatalog(csv);
      catalogCache = parsed;
      return parsed;
    })
    .catch(() => [])
    .finally(() => {
      catalogPromise = null;
    });

  return catalogPromise;
}

export function useSpeciesCatalog() {
  const [species, setSpecies] = useState<SpeciesCatalogItem[]>(catalogCache ?? []);
  const [isLoading, setIsLoading] = useState(!catalogCache);

  useEffect(() => {
    let cancelled = false;

    loadSpeciesCatalog().then((items) => {
      if (cancelled) return;
      setSpecies(items);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { species, isLoading };
}
