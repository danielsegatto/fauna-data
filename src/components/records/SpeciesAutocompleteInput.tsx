import { useMemo, useState } from "react";
import { Input } from "@/components/ui";
import { useSpeciesCatalog } from "@/hooks/useSpeciesCatalog";
import {
  speciesMatchesQuery,
  type SpeciesCatalogItem,
} from "@/lib/speciesCatalog";

interface SpeciesAutocompleteInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MAX_SUGGESTIONS = 10;

function SpeciesSuggestion({ item }: { item: SpeciesCatalogItem }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-base leading-tight font-semibold text-gray-900">
        {item.canonicalName}
      </p>
      {item.taxonName && (
        <p className="text-xs leading-tight text-gray-500 italic">
          {item.taxonName}
        </p>
      )}
      {item.portugueseName && (
        <p className="text-xs leading-tight text-gray-500">
          {item.portugueseName}
        </p>
      )}
    </div>
  );
}

export function SpeciesAutocompleteInput(props: SpeciesAutocompleteInputProps) {
  const { species, isLoading } = useSpeciesCatalog();
  const [isFocused, setIsFocused] = useState(false);

  const query = props.value.trim();

  const suggestions = useMemo(() => {
    if (!query) return [];
    return species
      .filter((item) => speciesMatchesQuery(item, query))
      .slice(0, MAX_SUGGESTIONS);
  }, [query, species]);

  const showSuggestions = isFocused && suggestions.length > 0;
  const showEmptyHint = isFocused && query.length > 0 && !isLoading && suggestions.length === 0;

  return (
    <div className="relative">
      <Input
        label={props.label}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        autoComplete="off"
        error={props.error}
      />

      {showSuggestions && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {suggestions.map((item) => {
              const optionKey = `${item.canonicalName}|${item.taxonName}|${item.portugueseName}`;
              return (
                <li key={optionKey}>
                  <button
                    type="button"
                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      props.onChange(item.canonicalName);
                      setIsFocused(false);
                    }}
                  >
                    <SpeciesSuggestion item={item} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showEmptyHint && (
        <p className="mt-1 text-xs text-gray-500">
          Nenhuma espécie encontrada para este texto.
        </p>
      )}
    </div>
  );
}
