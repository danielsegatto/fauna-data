import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileDown, Filter } from "lucide-react";
import { Page, Card, Button, Select, showToast } from "@/components/ui";
import { useRecords } from "@/hooks/useRecords";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useExport } from "@/hooks/useExport";
import { type ExportFilters } from "@/lib/recordFilters";
import { GROUP_LABELS } from "@/lib/types";

// ─── Date input component (native HTML) ──────────────────────────────────────

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                   transition-colors duration-150"
      />
    </div>
  );
}

// ─── Summary row ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const { collectionPoints } = useCollectionPoints();
  const { isExporting, exportCSV, filterRecords } = useExport();

  const [filters, setFilters] = useState<ExportFilters>({
    group: "",
    collectionPointId: "",
    startDate: "",
    endDate: "",
  });

  const set = <K extends keyof ExportFilters>(key: K, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Dropdown options
  const groupOptions = [
    { label: "Todos os grupos", value: "" },
    ...Object.entries(GROUP_LABELS).map(([value, label]) => ({ label, value })),
  ];

  const pointOptions = useMemo(() => {
    const points = filters.group
      ? collectionPoints.filter((p) => p.group === filters.group)
      : collectionPoints;
    return [
      { label: "Todos os pontos", value: "" },
      ...points.map((p) => ({ label: p.name, value: p.id })),
    ];
  }, [collectionPoints, filters.group]);

  // Live filtered count
  const pointMap = useMemo(() => {
    return collectionPoints.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});
  }, [collectionPoints]);

  const filteredCount = useMemo(
    () => filterRecords(records, filters).length,
    [records, filters, filterRecords]
  );

  const handleExport = async () => {
    if (filteredCount === 0) {
      showToast("warning", "Nenhum registro encontrado com esses filtros.");
      return;
    }
    const count = await exportCSV(records, filters, pointMap);
    if (count > 0) {
      showToast("success", `${count} registro${count !== 1 ? "s" : ""} exportado${count !== 1 ? "s" : ""}!`);
      navigate(-1);
    }
  };

  const handleClearFilters = () => {
    setFilters({ group: "", collectionPointId: "", startDate: "", endDate: "" });
  };

  const hasFilters =
    filters.group || filters.collectionPointId || filters.startDate || filters.endDate;

  return (
    <Page
      title="Exportar Dados"
      subtitle={`${filteredCount} registro${filteredCount !== 1 ? "s" : ""} selecionado${filteredCount !== 1 ? "s" : ""}`}
      back
      footer={
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          icon={<FileDown size={20} />}
          loading={isExporting}
          disabled={filteredCount === 0}
          onClick={handleExport}
        >
          {isExporting ? "Exportando..." : `Exportar CSV (${filteredCount})`}
        </Button>
      }
    >
      <div className="px-4 pt-4 pb-4 flex flex-col gap-4">

        {/* Filter card */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-primary" />
              <p className="text-sm font-bold text-gray-700">Filtros</p>
            </div>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-primary font-semibold active:opacity-70"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Group */}
            <Select
              label="Grupo de Fauna"
              options={groupOptions}
              value={filters.group}
              onChange={(v) => {
                set("group", v);
                set("collectionPointId", ""); // reset point when group changes
              }}
            />

            {/* Collection point */}
            {pointOptions.length > 1 && (
              <Select
                label="Ponto de Coleta"
                options={pointOptions}
                value={filters.collectionPointId}
                onChange={(v) => set("collectionPointId", v)}
              />
            )}

            {/* Date range */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Período</p>
              <div className="flex gap-3">
                <DateInput
                  label="De"
                  value={filters.startDate}
                  onChange={(v) => set("startDate", v)}
                />
                <DateInput
                  label="Até"
                  value={filters.endDate}
                  onChange={(v) => set("endDate", v)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Summary card */}
        <Card padding="md">
          <p className="text-sm font-bold text-gray-700 mb-3">Resumo da Exportação</p>
          <div className="flex flex-col divide-y divide-gray-100">
            <SummaryRow
              label="Registros selecionados"
              value={String(filteredCount)}
            />
            <SummaryRow label="Formato" value="CSV (UTF-8)" />
            <SummaryRow
              label="Grupo"
              value={
                filters.group
                  ? GROUP_LABELS[filters.group as keyof typeof GROUP_LABELS]
                  : "Todos"
              }
            />
            <SummaryRow
              label="Ponto de Coleta"
              value={
                filters.collectionPointId
                  ? (pointMap[filters.collectionPointId] ?? "—")
                  : "Todos"
              }
            />
            <SummaryRow
              label="Período"
              value={
                filters.startDate && filters.endDate
                  ? `${new Date(filters.startDate).toLocaleDateString("pt-BR")} → ${new Date(filters.endDate).toLocaleDateString("pt-BR")}`
                  : filters.startDate
                  ? `A partir de ${new Date(filters.startDate).toLocaleDateString("pt-BR")}`
                  : filters.endDate
                  ? `Até ${new Date(filters.endDate).toLocaleDateString("pt-BR")}`
                  : "Todo o período"
              }
            />
          </div>
        </Card>

        {/* CSV column info */}
        <Card padding="md">
          <p className="text-sm font-bold text-gray-700 mb-3">Colunas no arquivo CSV</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "ID", "Grupo", "Metodologia", "Data", "Hora",
              "Espécie", "Identificação", "Ambiente", "Estrato",
              "Atividade", "Quantidade", "Distância (m)", "Lado",
              "Ponto de Coleta", "Observações",
            ].map((col) => (
              <span
                key={col}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
              >
                {col}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}
