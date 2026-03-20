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
}

export function Select({ label, options, value, onChange, placeholder = "Selecione...", error, hint }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
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
        <span>{selectedLabel ?? placeholder}</span>
        <ChevronDown size={18} className={cn("text-gray-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-base text-left border-b border-gray-100 last:border-0 transition-colors duration-100 select-none",
                    isSelected ? "bg-green-50 text-primary font-semibold" : "text-gray-900 active:bg-gray-50"
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} className="text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
