import { type ReactNode } from "react";
import { cn } from "@/lib/theme";
import type { SelectOption } from "@/lib/types";

interface OptionGroupOption extends SelectOption {
  icon?: ReactNode;
}

interface OptionGroupProps {
  label: string;
  options: OptionGroupOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  allowClear?: boolean;
  clearLabel?: string;
}

export function OptionGroup({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  allowClear = false,
  clearLabel = "Limpar",
}: OptionGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-semibold text-gray-500 active:text-gray-700"
          >
            {clearLabel}
          </button>
        )}
      </div>

      <div
        className="grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
                "active:scale-95 transition-all duration-150 select-none",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                error && !isSelected && "border-red-200"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span>{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}