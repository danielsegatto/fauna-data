/**
 * Design system — single source of truth for colors, spacing, and utilities.
 * All components import from here.
 */

export const theme = {
  colors: {
    primary: "#2E7D32",
    primaryLight: "#4CAF50",
    primaryDark: "#1B5E20",
    primaryBg: "#E8F5E9",

    background: "#FFFFFF",
    surface: "#F5F5F5",
    surfaceHover: "#EEEEEE",

    foreground: "#11181C",
    muted: "#687076",

    border: "#E0E0E0",
    borderFocus: "#2E7D32",

    success: "#22C55E",
    successBg: "#F0FDF4",
    warning: "#F59E0B",
    warningBg: "#FFFBEB",
    error: "#EF4444",
    errorBg: "#FEF2F2",

    // Chart palette
    chart: [
      "#2E7D32",
      "#0a7ea4",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#F97316",
    ],
  },

  // Fauna group colors
  groups: {
    birds: { color: "#2E7D32", bg: "#E8F5E9" },
    mammals: { color: "#795548", bg: "#EFEBE9" },
    herpetofauna: { color: "#F57C00", bg: "#FFF3E0" },
  },
} as const;

/** Merge class names (utility) */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
