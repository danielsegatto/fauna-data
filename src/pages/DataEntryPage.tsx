import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  PlusCircle,
} from "lucide-react";
import {
  Page,
  Button,
  Card,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecordForm } from "@/hooks/useRecordForm";
import { useRecords } from "@/hooks/useRecords";
import { DataEntryFormCard } from "@/components/records/DataEntryFormCard";
import { RecordsListCard } from "@/components/records/RecordsListCard";
import { isMackinnonMethodology, hasMackinnonPointReachedLimit } from "@/lib/mackinnon";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  type FaunaGroup,
} from "@/lib/types";
import {
  emptyRecordForm,
  recordFormToObservationData,
} from "@/lib/recordForm";
import { theme } from "@/lib/theme";


// ─── Component ────────────────────────────────────────────────────────────────

export default function DataEntryPage() {
  const { group, methodology, pointId } = useParams<{
    group: string;
    methodology: string;
    pointId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const faunaGroup = group as FaunaGroup;
  const { color, bg } = theme.groups[faunaGroup] ?? theme.groups.birds;
  const groupLabel = GROUP_LABELS[faunaGroup] ?? group;
  const methodologyLabel = METHODOLOGY_LABELS[methodology ?? ""] ?? methodology;
  const pointName = (location.state as { pointName?: string } | null)?.pointName;
  const backToCollectionPoint = pointId ? `/collection-point/${pointId}` : true;

  const { collectionPoints, isLoading: isLoadingPoints } = useCollectionPoints();
  const { saveRecord, hasSpeciesRecordedAtPoint, filterRecords, deleteRecord } = useRecords();
  const collectionPoint = collectionPoints.find((item) => item.id === pointId);
  const isMackinnonPoint = isMackinnonMethodology(collectionPoint?.methodology ?? methodology);

  const { form, errors, setField, resetForm, validate } = useRecordForm();
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const persistRecord = async () => {
    setIsSaving(true);
    try {
      await saveRecord({
        collectionPointId: pointId ?? "",
        group: faunaGroup,
        methodology: methodology ?? "",
        data: recordFormToObservationData(form),
      });

      setSavedCount((n) => n + 1);
      resetForm(emptyRecordForm);
      showToast("success", "Registro salvo! Pronto para novo registro.");
    } catch {
      showToast("error", "Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const pointRecords = pointId
    ? filterRecords({ collectionPointId: pointId })
    : [];

  const selectedRecord = recordToDelete
    ? pointRecords.find((record) => record.id === recordToDelete)
    : undefined;

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      await deleteRecord(recordToDelete);
      showToast("success", "Registro removido com sucesso!");
      setDeleteOpen(false);
      setRecordToDelete(null);
    } catch {
      showToast("error", "Erro ao remover registro.");
    }
  };

  const handleSave = async () => {
    const { isValid } = validate();
    if (!isValid) {
      showToast("error", "Preencha todos os campos obrigatórios");
      return;
    }

    if (!pointId) {
      showToast("error", "Ponto de coleta inválido.");
      return;
    }

    if (isLoadingPoints) {
      showToast("error", "Aguarde o carregamento do ponto de coleta.");
      return;
    }

    if (!collectionPoint) {
      showToast("error", "Ponto de coleta não encontrado.");
      return;
    }

    if (isMackinnonPoint && collectionPoint.limit === undefined) {
      showToast("error", "Defina o limite da Lista de Mackinnon antes de adicionar registros.");
      navigate(`/collection-point/${collectionPoint.id}`);
      return;
    }

    if (isMackinnonPoint) {
      const pointRecords = filterRecords({ collectionPointId: collectionPoint.id });
      if (hasMackinnonPointReachedLimit(pointRecords.length, collectionPoint.limit)) {
        showToast("warning", `Limite de ${collectionPoint.limit} espécies atingido. Crie um novo ponto de coleta para continuar.`);
        return;
      }
    }

    if (
      isMackinnonPoint
      && hasSpeciesRecordedAtPoint({
        collectionPointId: collectionPoint.id,
        species: form.species,
      })
    ) {
      showToast("warning", "Espécie já registrada. Não é possível repetir na Lista de Mackinnon.");
      return;
    }

    await persistRecord();
  };

  return (
    <Page
      title="Entrada de Dados"
      subtitle={`${groupLabel} — ${methodologyLabel}`}
      back={backToCollectionPoint}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={<PlusCircle size={20} />}
            loading={isSaving}
            onClick={handleSave}
          >
            Salvar e Novo Registro
          </Button>
        </div>
      }
    >
      <div className="px-4 pt-5 pb-4 flex flex-col gap-4">

        {/* Context card */}
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: bg }}
            >
              <CheckCircle size={18} color={color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium">Ponto de Coleta</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {pointName ?? collectionPoint?.name ?? pointId}
              </p>
            </div>
            {savedCount > 0 && (
              <div
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {savedCount} salvo{savedCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </Card>

        <DataEntryFormCard
          form={form}
          errors={errors}
          group={faunaGroup}
          onFieldChange={setField}
        />

        <RecordsListCard
          records={pointRecords}
          title="Registros deste ponto"
          subtitle="Toque em um registro para editar ou remover."
          onOpenRecord={(recordId) => {
            navigate(`/records/${recordId}`, {
              state: { backTo: `/collection-point/${pointId}` },
            });
          }}
          onDeleteRecord={(recordId) => {
            setRecordToDelete(recordId);
            setDeleteOpen(true);
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        title="Remover Registro"
        message={selectedRecord
          ? `Você tem certeza que deseja remover o registro de ${selectedRecord.data.species}? Esta ação não pode ser desfeita.`
          : "Você tem certeza que deseja remover este registro? Esta ação não pode ser desfeita."}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteRecord}
        onCancel={() => {
          setDeleteOpen(false);
          setRecordToDelete(null);
        }}
      />
    </Page>
  );
}
