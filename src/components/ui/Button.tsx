import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white active:bg-primary-dark disabled:bg-primary/50",
  secondary: "bg-surface text-gray-900 border border-gray-200 active:bg-gray-100 disabled:opacity-50",
  danger: "bg-red-500 text-white active:bg-red-600 disabled:bg-red-300",
  ghost: "bg-transparent text-primary border border-primary active:bg-primary/10 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "py-2 px-4 text-sm rounded-xl gap-1.5 min-h-[36px]",
  md: "py-3 px-5 text-base rounded-xl gap-2 min-h-[44px]",
  lg: "py-4 px-6 text-base rounded-xl gap-2 min-h-[52px]",
};

export function Button({ variant = "primary", size = "md", loading = false, icon, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center font-semibold",
        "active:scale-95 transition-all duration-150 select-none",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={size === "sm" ? 14 : 18} /> : icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
