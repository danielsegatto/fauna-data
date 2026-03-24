import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1 mt-2">
      {children}
    </p>
  );
}