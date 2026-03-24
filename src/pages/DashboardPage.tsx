import { useState } from "react";
import { HBar } from "@/components/dashboard/HBar";
import { SectionTitle } from "@/components/dashboard/SectionTitle";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterTabs } from "@/components/shared/FilterTabs";

import {
  BarChart,

  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { Page, Card, EmptyState } from "@/components/ui";
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
              <>
                <SectionTitle>Registros por Data</SectionTitle>
                <Card padding="md">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={stats.byDate}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #f3f4f6",
                          fontSize: 12,
                        }}
                        cursor={{ fill: "#f3f4f6" }}
                      />
                      <Bar
                        dataKey="value"
                        name="Registros"
                        fill={theme.colors.primary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </>
            )}

            {/* ── By group ── */}
            {stats.byGroup.length > 0 && (
              <>
                <SectionTitle>Por Grupo de Fauna</SectionTitle>
                <Card padding="md">
                  <div className="flex flex-col gap-3">
                    {stats.byGroup.map((item, i) => (
                      <HBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        max={stats.byGroup[0].value}
                        color={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── Identification pie ── */}
            {stats.byIdentification.length > 0 && (
              <>
                <SectionTitle>Tipo de Identificação</SectionTitle>
                <Card padding="md">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.byIdentification}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="45%"
                        outerRadius={70}
                        label={({ label, percent }) =>
                          `${label} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {stats.byIdentification.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #f3f4f6",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {stats.byIdentification.map((item, i) => (
                      <div key={item.label} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600">
                          {item.label}: <strong>{item.value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── By methodology ── */}
            {stats.byMethodology.length > 0 && (
              <>
                <SectionTitle>Metodologias Usadas</SectionTitle>
                <Card padding="md">
                  <div className="flex flex-col gap-3">
                    {stats.byMethodology.map((item, i) => (
                      <HBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        max={stats.byMethodology[0].value}
                        color={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── Environment pie ── */}
            {stats.byEnvironment.length > 0 && (
              <>
                <SectionTitle>Distribuição por Ambiente</SectionTitle>
                <Card padding="md">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.byEnvironment}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="45%"
                        outerRadius={70}
                        label={({ label, percent }) =>
                          `${label} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {stats.byEnvironment.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #f3f4f6",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {stats.byEnvironment.map((item, i) => (
                      <div key={item.label} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600">
                          {item.label}: <strong>{item.value}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── Activity ── */}
            {stats.byActivity.length > 0 && (
              <>
                <SectionTitle>Distribuição por Atividade</SectionTitle>
                <Card padding="md">
                  <div className="flex flex-col gap-3">
                    {stats.byActivity.map((item, i) => (
                      <HBar
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        max={stats.byActivity[0].value}
                        color={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* ── Top species table ── */}
            {stats.topSpecies.length > 0 && (
              <>
                <SectionTitle>Top 10 Espécies</SectionTitle>
                <Card padding="md">
                  <div className="flex flex-col gap-3">
                    {stats.topSpecies.map((sp, i) => (
                      <HBar
                        key={sp.name}
                        label={sp.name}
                        value={sp.count}
                        max={stats.topSpecies[0].count}
                        color={theme.colors.primary}
                        rank={i + 1}
                      />
                    ))}
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
