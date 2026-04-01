import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { SectionTitle } from "./SectionTitle";

interface DashboardSectionProps {
  title?: string;
  children: ReactNode;
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <>
      {title && <SectionTitle>{title}</SectionTitle>}
      <Card padding="md">{children}</Card>
    </>
  );
}