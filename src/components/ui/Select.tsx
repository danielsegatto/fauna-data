import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/theme";
import type { SelectOption } from "@/lib/types";

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  searchable?: boolean;
  allowCustomValue?: boolean;
  emptyMessage?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  error,
  hint,
  searchable = false,
  allowCustomValue = false,
  emptyMessage,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label ?? value;
  const [searchValue, setSearchValue] = useState(displayValue);

  useEffect(() => {
    if (searchable) {
      setSearchValue(displayValue);
    }
  }, [displayValue, searchable]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedQuery = searchValue.trim().toLocaleLowerCase();
  const filteredOptions = searchable && normalizedQuery
    ? options.filter((option) => {
        const labelMatch = option.label.toLocaleLowerCase().includes(normalizedQuery);
        const valueMatch = option.value.toLocaleLowerCase().includes(normalizedQuery);
        return labelMatch || valueMatch;
      })
    : options;

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {searchable ? (
        <div className="relative">
          <input
            value={searchValue}
            placeholder={placeholder}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchValue(nextValue);
              setIsOpen(true);
              if (allowCustomValue) {
                onChange(nextValue);
              }
            }}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120);
            }}
            className={cn(
              "w-full px-4 py-3 pr-11 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
              error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : isOpen ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
            )}
          />
          <ChevronDown
            size={18}
            className={cn(
              "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white text-base text-left",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150 active:bg-gray-50 select-none",
            error ? "border-red-400" : isOpen ? "border-primary ring-2 ring-primary/30" : "border-gray-200",
            !value && "text-gray-400"
          )}
        >
          <span>{displayValue || placeholder}</span>
          <ChevronDown size={18} className={cn("text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
        </button>
      )}
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            {filteredOptions.length > 0 ? filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(option.value);
                    if (searchable) {
                      setSearchValue(option.label);
                    }
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-base text-left border-b border-gray-100 last:border-0 transition-colors duration-100 select-none",
                    isSelected ? "bg-green-50 text-primary font-semibold" : "text-gray-900 active:bg-gray-50"
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} className="text-primary shrink-0" />}
                </button>
              );
            }) : emptyMessage ? (
              <p className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</p>
            ) : null}
          </div>
        </div>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
