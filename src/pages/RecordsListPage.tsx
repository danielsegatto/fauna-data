import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ChevronRight, FileDown, ClipboardList } from "lucide-react";
import {
  Page,
  Card,
  Badge,
  Button,
  EmptyState,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { useRecords } from "@/hooks/useRecords";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  type FaunaGroup,
} from "@/lib/types";
import { formatDate, formatTime } from "@/lib/theme";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS: Array<{ id: FaunaGroup | "all"; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "birds", label: "Aves" },
  { id: "mammals", label: "Mamíferos" },
  { id: "herpetofauna", label: "Herpetofauna" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecordsListPage() {
  const navigate = useNavigate();
  const { records, isLoading, deleteRecord, filterRecords } = useRecords();
  const { getCollectionPointMap } = useCollectionPoints();

  const [activeFilter, setActiveFilter] = useState<FaunaGroup | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    species: string;
  } | null>(null);

  const pointMap = getCollectionPointMap();

  const filtered = filterRecords({ group: activeFilter });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecord(deleteTarget.id);
      showToast("success", `"${deleteTarget.species}" removido.`);
    } catch {
      showToast("error", "Erro ao deletar registro.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Page
        title="Registros Salvos"
        subtitle={`${filtered.length} registro${filtered.length !== 1 ? "s" : ""}`}
        back="/"
        actions={
          records.length > 0 ? (
            <button
              onClick={() => navigate("/export")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-all"
            >
              <FileDown size={16} />
              Exportar
            </button>
          ) : undefined
        }
      >
        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              const count =
                tab.id === "all"
                  ? records.length
                  : records.filter((r) => r.group === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                    whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-200 text-gray-600"
                    }
                  `}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                        isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-400">Carregando registros...</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={48} />}
              title="Nenhum registro encontrado"
              description={
                activeFilter === "all"
                  ? "Comece registrando sua primeira observação de fauna."
                  : `Nenhum registro de ${GROUP_LABELS[activeFilter as FaunaGroup]} encontrado.`
              }
              action={
                activeFilter === "all" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/")}
                  >
                    Fazer primeiro registro
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((record) => {
                const pointName = pointMap[record.collectionPointId];
                const date = formatDate(record.timestamp);
                const time = formatTime(record.timestamp);

                return (
                  <Card
                    key={record.id}
                    pressable
                    padding="none"
                    onClick={() =>
                      navigate(`/records/${record.id}`)
                    }
                    className="overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Top row: species + identification badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-gray-900 truncate">
                            {record.data.species}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {GROUP_LABELS[record.group]} •{" "}
                            {METHODOLOGY_LABELS[record.methodology] ??
                              record.methodology}
                          </p>
                        </div>
                        <Badge variant="primary">
                          {record.data.identification}
                        </Badge>
                      </div>

                      {/* Data grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <DataChip label="Qtd" value={String(record.data.quantity)} />
                        <DataChip label="Dist" value={`${record.data.distance}m`} />
                        <DataChip label="Lado" value={record.data.side} />
                        <DataChip label="Ambiente" value={record.data.environment} />
                        <DataChip label="Estrato" value={record.data.stratum} />
                        <DataChip label="Atividade" value={record.data.activity} />
                      </div>

                      {/* Bottom row: point, date, actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex-1 min-w-0">
                          {pointName && (
                            <p className="text-xs text-gray-400 truncate">
                              📍 {pointName}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {date} às {time}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                id: record.id,
                                species: record.data.species,
                              });
                            }}
                            className="p-2 rounded-lg text-red-400 active:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          {/* View detail */}
                          <ChevronRight size={16} className="text-gray-300" />
                        </div>
                      </div>
                    </div>

                    {/* Group accent bar */}
                    <div
                      className="h-0.5 w-full opacity-40"
                      style={{
                        backgroundColor:
                          record.group === "birds"
                            ? "#2E7D32"
                            : record.group === "mammals"
                            ? "#795548"
                            : "#F57C00",
                      }}
                    />
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Page>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Deletar registro"
        message={`Remover "${deleteTarget?.species}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

// ─── Small helper component ───────────────────────────────────────────────────

function DataChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">
        {label}
      </p>
      <p className="text-xs font-semibold text-gray-700 truncate">{value}</p>
    </div>
  );
}
