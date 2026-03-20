import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// ─── Reusable section title ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1 mt-2">
      {children}
    </p>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex-1">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Simple horizontal bar ────────────────────────────────────────────────────

function HBar({
  label,
  value,
  max,
  color,
  rank,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  rank?: number;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      {rank !== undefined && (
        <span className="text-xs text-gray-400 w-4 text-right shrink-0">{rank}.</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-gray-700 truncate pr-2">{label}</span>
          <span className="text-xs font-bold text-gray-900 shrink-0">{value}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

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
        <div className="flex gap-2">
          {RANGE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRange(tab.id)}
              className={`
                flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95
                ${range === tab.id
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600"}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
