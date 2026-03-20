import { type ReactNode } from "react";
import { cn } from "@/lib/theme";
import type { FaunaGroup } from "@/lib/types";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "group";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  group?: FaunaGroup;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-600",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-600",
  group: "",
};

const groupClasses: Record<FaunaGroup, string> = {
  birds: "bg-green-100 text-green-700",
  mammals: "bg-amber-100 text-amber-700",
  herpetofauna: "bg-orange-100 text-orange-700",
};

export function Badge({ children, variant = "default", group, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
      variant === "group" && group ? groupClasses[group] : variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
