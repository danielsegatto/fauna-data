import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, PlusCircle, Save, ClipboardList, FileDown, Trash2, MapPinned } from "lucide-react";
import {
  Page,
  Button,
  EmptyState,
  showToast,
} from "@/components/ui";
import { CollectionPointDeleteDialog } from "@/components/collection-points/CollectionPointDeleteDialog";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useDeleteDialog } from "@/hooks/useDeleteDialog";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useRecords } from "@/hooks/useRecords";
import { useExport } from "@/hooks/useExport";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { RecordsListCard } from "@/components/records/RecordsListCard";
import { CollectionPointMetadataCard } from "@/components/collection-points/CollectionPointMetadataCard";
import { CollectionPointEditForm } from "@/components/collection-points/CollectionPointEditForm";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { PageContent } from "@/components/shared/PageContent";
import { RecordsMap } from "@/components/shared/RecordsMap";
import {
  isMackinnonMethodology,
  parseMackinnonLimit,
  hasMackinnonPointReachedLimit,
} from "@/lib/mackinnon";
import { buildRecordMapPins } from "@/lib/recordMap";
import { type CollectionPointFormState } from "@/lib/types";

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function CollectionPointDetailPage() {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();

  const { collectionPoints, isLoading, updateCollectionPoint, deleteCollectionPoint } = useCollectionPoints();
  const { records, filterRecords, deleteRecord } = useRecords();
  const { isExporting, exportCSV, exportXLS } = useExport();

  const point = useMemo(
    () => collectionPoints.find((item) => item.id === pointId),
    [collectionPoints, pointId]
  );

  const [form, setForm] = useState<CollectionPointFormState | null>(null);
  const { errors, setError, clearError, clearAllErrors } = useFormErrors<{ name: string; methodology: string; limit: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeView, setActiveView] = useState<"records" | "map">("records");
  const [isDeletingPoint, setIsDeletingPoint] = useState(false);
  const [deletePointOpen, setDeletePointOpen] = useState(false);
  const { isOpen: deleteOpen, itemId: recordToDelete, open: openDelete, close: closeDelete } = useDeleteDialog<string>();

    const buildFormFromPoint = (targetPoint: NonNullable<typeof point>): CollectionPointFormState => ({
    name: targetPoint.name,
    notes: targetPoint.notes ?? "",
    latitude: targetPoint.latitude !== undefined ? String(targetPoint.latitude) : "",
    longitude: targetPoint.longitude !== undefined ? String(targetPoint.longitude) : "",
    accuracy: targetPoint.accuracy !== undefined ? String(targetPoint.accuracy) : "",
    limit: targetPoint.limit !== undefined ? String(targetPoint.limit) : "",
    group: targetPoint.group,
    methodology: targetPoint.methodology,
  });

  useEffect(() => {
    if (!point) return;
    setForm(buildFormFromPoint(point));
    clearAllErrors();
  }, [point, clearAllErrors]);



  const pointRecords = point
    ? filterRecords({ collectionPointId: point.id })
    : [];

  const pointMapData = useMemo(() => {
    if (!point) return { totalRecords: 0, mappableRecords: 0, unmappableRecords: 0, pins: [], collectionPointPins: [] };

    return buildRecordMapPins(pointRecords, [point], {
      collectionPointId: point.id,
    });
  }, [point, pointRecords]);

  const hasPointCoordinates = point
    ? Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    : false;

  const selectedRecord = recordToDelete
    ? pointRecords.find((record) => record.id === recordToDelete)
    : undefined;

  const pointMap = useMemo(() => {
    if (!point) return {} as Record<string, string>;
    return { [point.id]: point.name };
  }, [point]);

  const isAtLimit = !isEditing
    && isMackinnonMethodology(point?.methodology)
    && hasMackinnonPointReachedLimit(pointRecords.length, point?.limit);

  const set = <K extends keyof CollectionPointFormState>(field: K, value: CollectionPointFormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (field === "name") clearError("name");
    if (field === "methodology") clearError("methodology");
    if (field === "limit") clearError("limit");
  };

  const handleSave = async () => {
    if (!point || !form) return;

    if (!form.name.trim()) {
      setError("name", "Nome do ponto é obrigatório");
      return;
    }

    if (!form.methodology.trim()) {
      setError("methodology", "Metodologia é obrigatória");
      return;
    }

    const parsedLimit = parseMackinnonLimit(form.limit);
    if (isMackinnonMethodology(form.methodology) && parsedLimit === undefined) {
      setError("limit", "Informe um limite inteiro maior que zero");
      return;
    }

    setIsSaving(true);
    try {
      await updateCollectionPoint(point.id, {
        name: form.name.trim(),
        notes: form.notes.trim() || undefined,
        latitude: parseOptionalNumber(form.latitude),
        longitude: parseOptionalNumber(form.longitude),
        accuracy: parseOptionalNumber(form.accuracy),
        limit: isMackinnonMethodology(form.methodology) ? parsedLimit : undefined,
        group: form.group,
        methodology: form.methodology,
      });

      showToast("success", "Ponto de coleta atualizado com sucesso.");
      setIsEditing(false);
    } catch {
      showToast("error", "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRecord = () => {
    if (!point) return;
    if (isMackinnonMethodology(point.methodology) && point.limit === undefined) {
      showToast("error", "Defina o limite da Lista de Mackinnon antes de adicionar registros.");
      setForm(buildFormFromPoint(point));
      setError("limit", "Defina um limite antes de continuar");
      setIsEditing(true);
      return;
    }

    if (isAtLimit) {
      showToast("warning", "Limite alcançado. Inicie um novo ponto de coleta.");
      return;
    }

    navigate(`/data-entry/${point.group}/${point.methodology}/${point.id}`, {
      state: { pointName: point.name },
    });
  };

  const handleCancelEdit = () => {
    if (!point) return;
    setForm(buildFormFromPoint(point));
    clearAllErrors();
    setIsEditing(false);
  };

  const handleExportPointRecords = async () => {
    if (!point) return;

    const count = await exportCSV(
      records,
      {
        group: "",
        collectionPointId: point.id,
        collectionPointIds: [],
        startDate: "",
        endDate: "",
      },
      pointMap
    );

    if (count === 0) {
      showToast("warning", "Nenhum registro encontrado para este ponto de coleta.");
      return;
    }

    showToast(
      "success",
      `${count} registro${count !== 1 ? "s" : ""} exportado${count !== 1 ? "s" : ""} em CSV!`
    );
  };

  const handleExportPointRecordsXLS = async () => {
    if (!point) return;

    const count = await exportXLS(
      records,
      {
        group: "",
        collectionPointId: point.id,
        collectionPointIds: [],
        startDate: "",
        endDate: "",
      },
      pointMap
    );

    if (count === 0) {
      showToast("warning", "Nenhum registro encontrado para este ponto de coleta.");
      return;
    }

    showToast(
      "success",
      `${count} registro${count !== 1 ? "s" : ""} exportado${count !== 1 ? "s" : ""} em XLSX!`
    );
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      await deleteRecord(recordToDelete);
      showToast("success", "Registro removido com sucesso!");
      closeDelete();
    } catch {
      showToast("error", "Erro ao remover registro.");
    }
  };

  const handleDeletePoint = async () => {
    if (!point || isDeletingPoint) return;

    setIsDeletingPoint(true);
    try {
      const pointGroup = point.group;
      const removedRecordsCount = pointRecords.length;

      await deleteCollectionPoint(point.id);

      setDeletePointOpen(false);
      showToast(
        "success",
        removedRecordsCount > 0
          ? `Ponto de coleta removido com ${removedRecordsCount} registro${removedRecordsCount !== 1 ? "s vinculados" : " vinculado"}.`
          : "Ponto de coleta removido com sucesso."
      );
      navigate(`/collection-points/${pointGroup}`);
    } catch {
      showToast("error", "Não foi possível remover o ponto de coleta.");
    } finally {
      setIsDeletingPoint(false);
    }
  };

  return (
    <>
      <Page
      title={point ? point.name : "Ponto de Coleta"}
      back={point ? `/collection-points/${point.group}` : "/"}
      actions={
        point && !isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeletePointOpen(true)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-red-50 text-red-600 text-sm font-semibold active:scale-95 transition-all hover:bg-red-100"
              aria-label="Remover ponto de coleta"
              title="Remover ponto de coleta"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-all"
              aria-label="Editar ponto de coleta"
              title="Editar ponto de coleta"
            >
              <Edit3 size={15} />
            </button>
          </div>
        ) : undefined
      }
      footer={
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<Save size={20} />}
                loading={isSaving}
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={handleCancelEdit}
              >
                Cancelar Edição
              </Button>
            </>
          ) : (
            <>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<PlusCircle size={20} />}
                onClick={handleAddRecord}
                disabled={!point}
              >
                Adicionar Registro
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  icon={<FileDown size={18} />}
                  loading={isExporting}
                  onClick={handleExportPointRecords}
                  disabled={!point || pointRecords.length === 0}
                >
                  CSV
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  icon={<FileDown size={18} />}
                  loading={isExporting}
                  onClick={handleExportPointRecordsXLS}
                  disabled={!point || pointRecords.length === 0}
                >
                  XLSX
                </Button>
              </div>
              {isAtLimit && point && (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  icon={<PlusCircle size={18} />}
                  onClick={() => navigate(`/methodologies/${point.group}`)}
                >
                  Criar Novo Ponto de Coleta
                </Button>
              )}
            </>
          )}
        </div>
      }
    >
      <PageContent>
        {isLoading || !form ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">Carregando ponto...</p>
          </div>
        ) : !point ? (
          <EmptyState
            icon={<Edit3 size={48} />}
            title="Ponto não encontrado"
            description="Este ponto pode ter sido removido."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
                Voltar ao início
              </Button>
            }
          />
        ) : (
          <>
            <CollectionPointMetadataCard point={point} recordCount={pointRecords.length} />

            {!isEditing && (
              <FilterTabs
                tabs={[
                  { id: "records", label: "Registros" },
                  { id: "map", label: "Mapa" },
                ]}
                activeTab={activeView}
                onChange={setActiveView}
                getCount={(tabId) => (tabId === "records" ? pointRecords.length : pointMapData.mappableRecords)}
                fullWidth
              />
            )}

            {isEditing && (
              <CollectionPointEditForm
                form={form}
                errors={{ name: errors.name ?? "", methodology: errors.methodology ?? "", limit: errors.limit ?? "" }}
                onChange={set}
              />
            )}

            {(isEditing || activeView === "records") && (
              <RecordsListCard
                records={pointRecords}
                title="Registros deste ponto"
                icon={<ClipboardList size={18} className="text-gray-500" />}
                subtitle={
                  isMackinnonMethodology(point.methodology) && point.limit !== undefined
                    ? `Progresso atual: ${pointRecords.length}/${point.limit}`
                    : undefined
                }
                onOpenRecord={(recordId) => {
                  navigate(`/records/${recordId}`, {
                    state: { backTo: `/collection-point/${point.id}` },
                  });
                }}
                onDeleteRecord={(recordId) => {
                  openDelete(recordId);
                }}
              />
            )}

            {!isEditing && activeView === "map" && (
              pointMapData.mappableRecords === 0 && pointMapData.collectionPointPins.length === 0 ? (
                <EmptyState
                  icon={<MapPinned size={48} />}
                  title={pointMapData.totalRecords === 0 ? "Nenhum registro neste ponto" : "Sem coordenadas para mapear"}
                  description={
                    pointMapData.totalRecords === 0
                      ? "Adicione registros para visualizar este ponto no mapa."
                      : hasPointCoordinates
                      ? "Os registros deste ponto ainda não possuem coordenadas válidas para visualização no mapa."
                      : "Este ponto ainda não tem latitude e longitude. Edite o ponto para habilitar a visualização geográfica."
                  }
                />
              ) : (
                <RecordsMap
                  pins={pointMapData.pins}
                  collectionPointPins={pointMapData.collectionPointPins}
                  onOpenRecord={(recordId) => {
                    navigate(`/records/${recordId}`, {
                      state: { backTo: `/collection-point/${point.id}` },
                    });
                  }}
                />
              )
            )}
          </>
        )}
      </PageContent>
    </Page>

    <RecordDeleteDialog
      isOpen={deleteOpen}
      species={selectedRecord?.data.species}
      onConfirm={handleDeleteRecord}
      onCancel={closeDelete}
    />

    <CollectionPointDeleteDialog
      isOpen={deletePointOpen}
      pointName={point?.name}
      recordsCount={pointRecords.length}
      onConfirm={handleDeletePoint}
      onCancel={() => {
        if (!isDeletingPoint) setDeletePointOpen(false);
      }}
    />
    </>
  );
}
