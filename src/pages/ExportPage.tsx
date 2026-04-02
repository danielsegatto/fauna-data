import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileDown, Filter } from "lucide-react";
import { Page, Card, Button, Select, showToast } from "@/components/ui";
import { useRecords } from "@/hooks/useRecords";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useExport } from "@/hooks/useExport";
import { PageContent } from "@/components/shared/PageContent";
import { type ExportFilters } from "@/lib/recordFilters";
import { buildCollectionPointMap } from "@/lib/collectionPointHelpers";
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
  const [searchParams] = useSearchParams();
  const { records } = useRecords();
  const { collectionPoints } = useCollectionPoints();
  const { isExporting, exportCSV, exportXLS, filterRecords } = useExport();

  const groupFromQuery = searchParams.get("group");
  const initialGroup = groupFromQuery && groupFromQuery in GROUP_LABELS
    ? groupFromQuery
    : "";

  const [filters, setFilters] = useState<ExportFilters>({
    group: initialGroup,
    collectionPointId: "",
    collectionPointIds: [],
    startDate: "",
    endDate: "",
  });

  const setField = <K extends keyof ExportFilters>(key: K, value: ExportFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Dropdown options
  const groupOptions = [
    { label: "Todos os grupos", value: "" },
    { label: "Ave", value: "birds" },
    { label: "Mamífero", value: "mammals" },
    { label: "Herpetofauna", value: "herpetofauna" },
  ];

  const pointsByGroup = useMemo(() => {
    return filters.group
      ? collectionPoints.filter((p) => p.group === filters.group)
      : collectionPoints;
  }, [collectionPoints, filters.group]);

  // Live filtered count
  const pointMap = useMemo(() => {
    return buildCollectionPointMap(collectionPoints);
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
      showToast("success", `${count} registro${count !== 1 ? "s" : ""} exportado${count !== 1 ? "s" : ""} em CSV!`);
      navigate(-1);
    }
  };

  const handleExportXLS = async () => {
    if (filteredCount === 0) {
      showToast("warning", "Nenhum registro encontrado com esses filtros.");
      return;
    }
    const count = await exportXLS(records, filters, pointMap);
    if (count > 0) {
      showToast("success", `${count} registro${count !== 1 ? "s" : ""} exportado${count !== 1 ? "s" : ""} em XLSX!`);
      navigate(-1);
    }
  };

  const handleClearFilters = () => {
    setFilters({ group: "", collectionPointId: "", collectionPointIds: [], startDate: "", endDate: "" });
  };

  const hasFilters =
    filters.group || filters.collectionPointIds.length > 0 || filters.startDate || filters.endDate;

  const areAllVisiblePointsSelected =
    pointsByGroup.length > 0
    && pointsByGroup.every((point) => filters.collectionPointIds.includes(point.id));

  const toggleCollectionPoint = (pointId: string) => {
    setFilters((prev) => {
      const alreadySelected = prev.collectionPointIds.includes(pointId);
      return {
        ...prev,
        collectionPointId: "",
        collectionPointIds: alreadySelected
          ? prev.collectionPointIds.filter((id) => id !== pointId)
          : [...prev.collectionPointIds, pointId],
      };
    });
  };

  const toggleAllVisiblePoints = () => {
    setFilters((prev) => ({
      ...prev,
      collectionPointId: "",
      collectionPointIds: areAllVisiblePointsSelected ? [] : pointsByGroup.map((point) => point.id),
    }));
  };

  return (
    <Page
      title="Exportar Dados"
      subtitle={`${filteredCount} registro${filteredCount !== 1 ? "s" : ""} selecionado${filteredCount !== 1 ? "s" : ""}`}
      back
      footer={
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            icon={<FileDown size={20} />}
            loading={isExporting}
            disabled={filteredCount === 0}
            onClick={handleExport}
          >
            {isExporting ? "Exportando..." : `CSV (${filteredCount})`}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            icon={<FileDown size={20} />}
            loading={isExporting}
            disabled={filteredCount === 0}
            onClick={handleExportXLS}
          >
            {isExporting ? "Exportando..." : `XLSX (${filteredCount})`}
          </Button>
        </div>
      }
    >
      <PageContent topPadding="md">

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
                setField("group", v);
                setField("collectionPointId", "");
                setField("collectionPointIds", []);
              }}
            />

            {/* Collection points */}
            {filters.group && pointsByGroup.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Pontos de Coleta</p>
                  <button
                    type="button"
                    onClick={toggleAllVisiblePoints}
                    className="text-xs text-primary font-semibold active:opacity-70"
                  >
                    {areAllVisiblePointsSelected ? "Desmarcar todos" : "Selecionar todos"}
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
                  {pointsByGroup.map((point) => {
                    const isSelected = filters.collectionPointIds.includes(point.id);
                    return (
                      <label
                        key={point.id}
                        className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 border border-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCollectionPoint(point.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/40"
                        />
                        <span className="text-sm text-gray-700">{point.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {filters.group && pointsByGroup.length === 0 && (
              <p className="text-sm text-gray-500">
                Nenhum ponto de coleta cadastrado para este grupo.
              </p>
            )}

            {/* Date range */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Período</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <DateInput
                  label="De"
                  value={filters.startDate}
                  onChange={(v) => setField("startDate", v)}
                />
                <DateInput
                  label="Até"
                  value={filters.endDate}
                  onChange={(v) => setField("endDate", v)}
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
            <SummaryRow label="Formatos disponíveis" value="CSV ou XLSX" />
            <SummaryRow
              label="Grupo"
              value={
                filters.group
                  ? GROUP_LABELS[filters.group as keyof typeof GROUP_LABELS]
                  : "Todos"
              }
            />
            <SummaryRow
              label="Pontos de Coleta"
              value={
                filters.collectionPointIds.length > 0
                  ? `${filters.collectionPointIds.length} selecionado${filters.collectionPointIds.length !== 1 ? "s" : ""}`
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
          <p className="text-sm font-bold text-gray-700 mb-3">Colunas em ambos os formatos</p>
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
      </PageContent>
    </Page>
  );
}
