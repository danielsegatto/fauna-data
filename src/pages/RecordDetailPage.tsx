import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Pencil, CheckCircle, X, Trash2 } from "lucide-react";
import {
  Page,
  Card,
  Badge,
  Button,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { useRecords } from "@/hooks/useRecords";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { RecordViewCard } from "@/components/records/RecordViewCard";
import { RecordFormCard } from "@/components/records/RecordFormCard";
import { MetadataField } from "@/components/shared/MetadataField";
import { PageContent } from "@/components/shared/PageContent";
import {
  isMackinnonMethodology,
  normalizeSpeciesName,
} from "@/lib/mackinnon";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
} from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import {
  hasRecordFormChangesFromObservation,
  recordFormToObservationData,
} from "@/lib/recordForm";
import { useRecordForm } from "@/hooks/useRecordForm";

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { records, updateRecord, deleteRecord, hasSpeciesRecordedAtPoint } = useRecords();
  const { collectionPoints } = useCollectionPoints();

  const record = records.find((r) => r.id === recordId);
  const collectionPoint = record
    ? collectionPoints.find((point) => point.id === record.collectionPointId)
    : undefined;
  const backTo = (location.state as { backTo?: string } | null)?.backTo
    ?? (collectionPoint ? `/collection-points/${collectionPoint.group}` : "/");

  const [isEditing, setIsEditing] = useState(false);
  const { form, errors, setField, loadObservationData, validate } = useRecordForm();
  const [isSaving, setIsSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const persistRecordUpdate = async () => {
    if (!record) return;

    setIsSaving(true);
    try {
      await updateRecord(record.id, {
        data: recordFormToObservationData(form),
      });
      showToast("success", "Registro atualizado com sucesso!");
      setIsEditing(false);
    } catch {
      showToast("error", "Erro ao atualizar registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!record) return;

    const { isValid } = validate();
    if (!isValid) {
      showToast("error", "Preencha todos os campos obrigatórios");
      return;
    }

    const hasSpeciesChanged = normalizeSpeciesName(form.species)
      !== normalizeSpeciesName(record.data.species);

    if (
      hasSpeciesChanged
      && collectionPoint
      && isMackinnonMethodology(collectionPoint.methodology)
      && hasSpeciesRecordedAtPoint({
        collectionPointId: collectionPoint.id,
        species: form.species,
        excludeRecordId: record.id,
      })
    ) {
      showToast("warning", "Espécie já registrada. Não é possível repetir na Lista de Mackinnon.");
      return;
    }

    await persistRecordUpdate();
  };

  const handleCancelEdit = () => {
    // If form was touched, ask for confirmation
    if (record) {
      const dirty = hasRecordFormChangesFromObservation(form, record.data);
      if (dirty) { setDiscardOpen(true); return; }
    }
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!record) return;
    loadObservationData(record.data);
    setIsEditing(true);
  };

  const handleDeleteRecord = async () => {
    if (!record) return;
    try {
      await deleteRecord(record.id);
      showToast("success", "Registro removido com sucesso!");
      navigate(backTo);
    } catch {
      showToast("error", "Erro ao remover registro.");
    }
  };

  // ─── Not found ──────────────────────────────────────────────────────────────

  if (!record) {
    return (
      <Page title="Registro" back={backTo}>
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-gray-400">Registro não encontrado.</p>
        </div>
      </Page>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Page
        title={isEditing ? "Editar Registro" : record.data.species}
        subtitle={`${GROUP_LABELS[record.group]} — ${METHODOLOGY_LABELS[record.methodology] ?? record.methodology}`}
        back={isEditing ? undefined : backTo}
        actions={
          !isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-red-50 text-red-600 text-sm font-semibold active:scale-95 transition-all hover:bg-red-100"
                aria-label="Deletar registro"
                title="Deletar registro"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-all"
                aria-label="Editar registro"
                title="Editar registro"
              >
                <Pencil size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold active:scale-95 transition-all"
            >
              <X size={15} />
              Cancelar
            </button>
          )
        }
        footer={
          isEditing ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<CheckCircle size={20} />}
              loading={isSaving}
              onClick={handleSave}
            >
              Salvar Alterações
            </Button>
          ) : undefined
        }
      >
        <PageContent topPadding="md">

          {/* Meta card */}
          <Card padding="md">
            <div className="flex flex-col gap-2">
              <MetadataField
                label="Data e hora"
                value={formatDateTime(record.timestamp)}
                layout="inline"
                valueClassName="text-xs font-semibold text-gray-700"
              />
              {collectionPoint?.name && (
                <MetadataField
                  label="Ponto de Coleta"
                  value={collectionPoint.name}
                  layout="inline"
                  valueClassName="text-xs font-semibold text-gray-700 truncate max-w-[60%] text-right"
                />
              )}
              <MetadataField
                label="Identificação"
                value={<Badge variant="primary">{record.data.identification}</Badge>}
                layout="inline"
              />
            </div>
          </Card>

          {/* View mode */}
          {!isEditing && (
            <RecordViewCard record={record} />
          )}

          {/* Edit mode */}
          {isEditing && (
            <RecordFormCard
              form={form}
              errors={errors}
              group={record.group}
              onFieldChange={setField}
            />
          )}
        </PageContent>
      </Page>

      {/* Discard changes confirmation */}
      <ConfirmDialog
        isOpen={discardOpen}
        title="Descartar alterações"
        message="Você tem alterações não salvas. Deseja descartá-las?"
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        variant="danger"
        onConfirm={() => { setDiscardOpen(false); setIsEditing(false); }}
        onCancel={() => setDiscardOpen(false)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Remover Registro"
        message={`Você tem certeza que deseja remover o registro de ${record?.data.species}? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteRecord}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
