import { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChartSection } from "@/components/dashboard/BarChartSection";
import { PieChartWithLegend } from "@/components/dashboard/PieChartWithLegend";
import { HBarChartSection } from "@/components/dashboard/HBarChartSection";
import { FilterTabs } from "@/components/shared/FilterTabs";

import { BarChart2 } from "lucide-react";
import { Page, EmptyState } from "@/components/ui";
import { useStatistics, type TimeRange } from "@/hooks/useStatistics";
import { theme } from "@/lib/theme";

// ─── Colour palette for charts ────────────────────────────────────────────────

const COLORS = theme.colors.chart;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>("all");
  const stats = useStatistics(range);

  const RANGE_TABS: Array<{ id: TimeRange; label: string }> = [
    { id: "all", label: "Todos" },
    { id: "7days", label: "7 dias" },
    { id: "30days", label: "30 dias" },
  ];

  return (
    <Page title="Painel de Análise" subtitle="Estatísticas dos dados coletados" back="/">
      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">

        {/* Time range filter */}
        <FilterTabs
          tabs={RANGE_TABS}
          activeTab={range}
          onChange={setRange}
          getCount={() => 0}
          fullWidth
        />

        {/* Empty state */}
        {stats.totalRecords === 0 ? (
          <EmptyState
            icon={<BarChart2 size={48} />}
            title="Nenhum dado disponível"
            description="Registre observações de fauna para ver as estatísticas aqui."
          />
        ) : (
          <>
            {/* ── KPI row ── */}
            <div className="flex gap-3">
              <StatCard
                label="Total de Registros"
                value={stats.totalRecords}
                sub={`${stats.uniqueSpecies} espécie${stats.uniqueSpecies !== 1 ? "s" : ""}`}
              />
              <StatCard
                label="Qtd Média"
                value={stats.avgQuantity}
                sub={`Máx: ${stats.maxQuantity}`}
              />
            </div>

            {/* ── Records over time ── */}
            {stats.byDate.length > 1 && (
              <BarChartSection title="Registros por Data" data={stats.byDate} />
            )}

            {/* ── By group ── */}
            {stats.byGroup.length > 0 && (
              <HBarChartSection
                title="Por Grupo de Fauna"
                data={stats.byGroup}
                colors={COLORS}
              />
            )}

            {/* ── Identification pie ── */}
            {stats.byIdentification.length > 0 && (
              <PieChartWithLegend
                title="Tipo de Identificação"
                data={stats.byIdentification}
                colors={COLORS}
              />
            )}

            {/* ── By methodology ── */}
            {stats.byMethodology.length > 0 && (
              <HBarChartSection
                title="Metodologias Usadas"
                data={stats.byMethodology}
                colors={COLORS}
              />
            )}

            {/* ── Environment pie ── */}
            {stats.byEnvironment.length > 0 && (
              <PieChartWithLegend
                title="Distribuição por Ambiente"
                data={stats.byEnvironment}
                colors={COLORS}
              />
            )}

            {/* ── Activity ── */}
            {stats.byActivity.length > 0 && (
              <HBarChartSection
                title="Distribuição por Atividade"
                data={stats.byActivity}
                colors={COLORS}
              />
            )}

            {/* ── Top species table ── */}
            {stats.topSpecies.length > 0 && (
              <HBarChartSection
                title="Top 10 Espécies"
                data={stats.topSpecies.map((sp, i) => ({
                  label: sp.name,
                  value: sp.count,
                  rank: i + 1,
                }))}
                colors={COLORS}
                singleColor
              />
            )}
          </>
        )}
      </div>
    </Page>
  );
}
