import type { ReactNode } from "react";
import { cn } from "@/lib/theme";

type MetadataFieldProps = {
  label: string;
  value: ReactNode;
  layout?: "stack" | "inline";
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function MetadataField({
  label,
  value,
  layout = "stack",
  className,
  labelClassName,
  valueClassName,
}: MetadataFieldProps) {
  const isInline = layout === "inline";

  return (
    <div
      className={cn(
        isInline ? "flex items-center justify-between" : "flex flex-col",
        className
      )}
    >
      <p className={cn("text-xs text-gray-400 font-medium", labelClassName)}>{label}</p>
      <div className={cn("text-sm text-gray-700", valueClassName)}>{value}</div>
    </div>
  );
}
