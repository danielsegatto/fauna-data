import { StatCard } from "@/components/dashboard/StatCard";

interface StatsOverviewSectionProps {
  totalRecords: number;
  uniqueSpecies: number;
  avgQuantity: number;
  maxQuantity: number;
}

export function StatsOverviewSection({
  totalRecords,
  uniqueSpecies,
  avgQuantity,
  maxQuantity,
}: StatsOverviewSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <StatCard
        label="Total de Registros"
        value={totalRecords}
        sub={`${uniqueSpecies} espécie${uniqueSpecies !== 1 ? "s" : ""}`}
      />
      <StatCard
        label="Qtd Média"
        value={avgQuantity}
        sub={`Máx: ${maxQuantity}`}
      />
    </div>
  );
}