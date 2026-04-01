import type { ReactNode } from "react";
import { cn } from "@/lib/theme";

type PageContentProps = {
  children: ReactNode;
  topPadding?: "md" | "lg";
  className?: string;
};

export function PageContent({
  children,
  topPadding = "lg",
  className,
}: PageContentProps) {
  return (
    <div
      className={cn(
        "px-4 pb-4 flex flex-col gap-4",
        topPadding === "lg" ? "pt-5" : "pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
