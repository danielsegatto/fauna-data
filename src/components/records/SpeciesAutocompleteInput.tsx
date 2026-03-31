import { useMemo, useState } from "react";
import { Input } from "@/components/ui";
import { useSpeciesCatalog } from "@/hooks/useSpeciesCatalog";
import type { FaunaGroup } from "@/lib/types";
import {
  findMatchSpans,
  getOrderedSpeciesAutocompleteMatches,
  type MatchSpan,
  type SpeciesCatalogItem,
} from "@/lib/speciesCatalog";

interface SpeciesAutocompleteInputProps {
  group: FaunaGroup;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MAX_SUGGESTIONS = 10;

function HighlightedText({
  text,
  spans,
}: {
  text: string;
  spans: MatchSpan[];
}) {
  if (!spans.length) return <>{text}</>;

  const parts: Array<{ key: string; value: string; isMatch: boolean }> = [];
  let cursor = 0;

  spans.forEach((span, index) => {
    if (span.start > cursor) {
      parts.push({
        key: `text-${index}-${cursor}`,
        value: text.slice(cursor, span.start),
        isMatch: false,
      });
    }

    parts.push({
      key: `match-${index}-${span.start}`,
      value: text.slice(span.start, span.end),
      isMatch: true,
    });

    cursor = span.end;
  });

  if (cursor < text.length) {
    parts.push({
      key: `text-tail-${cursor}`,
      value: text.slice(cursor),
      isMatch: false,
    });
  }

  return (
    <>
      {parts.map((part) => (
        part.isMatch ? (
          <mark
            key={part.key}
            className="rounded bg-amber-100 px-0.5 text-gray-900"
          >
            {part.value}
          </mark>
        ) : (
          <span key={part.key}>{part.value}</span>
        )
      ))}
    </>
  );
}

function SpeciesSuggestion({ item, query }: { item: SpeciesCatalogItem; query: string }) {
  const primaryName = item.taxonName || item.canonicalName;
  const secondaryCanonical = item.canonicalName !== primaryName ? item.canonicalName : "";

  const primarySpans = findMatchSpans(primaryName, query);
  const canonicalSpans = findMatchSpans(item.canonicalName, query);
  const portugueseSpans = findMatchSpans(item.portugueseName, query);

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-base leading-tight font-semibold text-gray-900">
        <HighlightedText text={primaryName} spans={primarySpans} />
      </p>
      {secondaryCanonical && (
        <p className="text-xs leading-tight text-gray-500 italic">
          <HighlightedText text={secondaryCanonical} spans={canonicalSpans} />
        </p>
      )}
      {item.portugueseName && (
        <p className="text-xs leading-tight text-gray-500">
          <HighlightedText text={item.portugueseName} spans={portugueseSpans} />
        </p>
      )}
    </div>
  );
}

export function SpeciesAutocompleteInput(props: SpeciesAutocompleteInputProps) {
  const { species, isLoading } = useSpeciesCatalog(props.group);
  const [isFocused, setIsFocused] = useState(false);

  const query = props.value.trim();

  const suggestions = useMemo(() => {
    return getOrderedSpeciesAutocompleteMatches(species, query, MAX_SUGGESTIONS);
  }, [query, species]);

  const showSuggestions = isFocused && suggestions.length > 0;
  const showEmptyHint = isFocused && query.length > 0 && !isLoading && suggestions.length === 0;
  const canClear = props.value.length > 0;

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

      {canClear && (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            onMouseDown={(event) => {
              event.preventDefault();
              props.onChange("");
              setIsFocused(false);
            }}
          >
            Limpar campo
          </button>
        </div>
      )}

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
                      props.onChange(item.taxonName || item.canonicalName);
                      setIsFocused(false);
                    }}
                  >
                    <SpeciesSuggestion item={item} query={query} />
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
