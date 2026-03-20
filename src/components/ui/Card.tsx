import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/theme";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  pressable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = { none: "", sm: "p-3", md: "p-4", lg: "p-5" };

export function Card({ children, pressable = false, padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-card",
        pressable && "active:scale-[0.98] active:shadow-none transition-all duration-150 cursor-pointer select-none",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
