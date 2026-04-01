import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import {
  Page,
  Button,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { RecordFormCard } from "@/components/records/RecordFormCard";
import { RecordMetadataCard } from "@/components/records/RecordMetadataCard";
import { RecordPageActions } from "@/components/records/RecordPageActions";
import { RecordViewCard } from "@/components/records/RecordViewCard";
import { PageContent } from "@/components/shared/PageContent";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecordForm } from "@/hooks/useRecordForm";
import { useRecords } from "@/hooks/useRecords";
import {
  isMackinnonMethodology,
  normalizeSpeciesName,
} from "@/lib/mackinnon";
import {
  hasRecordFormChangesFromObservation,
  recordFormToObservationData,
} from "@/lib/recordForm";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
} from "@/lib/types";

export default function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { records, updateRecord, deleteRecord, hasSpeciesRecordedAtPoint } = useRecords();
  const { collectionPoints } = useCollectionPoints();

  const record = records.find((item) => item.id === recordId);
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
    if (record) {
      const dirty = hasRecordFormChangesFromObservation(form, record.data);
      if (dirty) {
        setDiscardOpen(true);
        return;
      }
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

  if (!record) {
    return (
      <Page title="Registro" back={backTo}>
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-gray-400">Registro não encontrado.</p>
        </div>
      </Page>
    );
  }

  return (
    <>
      <Page
        title={isEditing ? "Editar Registro" : record.data.species}
        subtitle={`${GROUP_LABELS[record.group]} — ${METHODOLOGY_LABELS[record.methodology] ?? record.methodology}`}
        back={isEditing ? undefined : backTo}
        actions={
          <RecordPageActions
            isEditing={isEditing}
            onStartEdit={handleStartEdit}
            onDelete={() => setDeleteOpen(true)}
            onCancelEdit={handleCancelEdit}
          />
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
          <RecordMetadataCard
            record={record}
            collectionPointName={collectionPoint?.name}
          />

          {!isEditing && <RecordViewCard record={record} />}

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

      <ConfirmDialog
        isOpen={discardOpen}
        title="Descartar alterações"
        message="Você tem alterações não salvas. Deseja descartá-las?"
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        variant="danger"
        onConfirm={() => {
          setDiscardOpen(false);
          setIsEditing(false);
        }}
        onCancel={() => setDiscardOpen(false)}
      />

      <RecordDeleteDialog
        isOpen={deleteOpen}
        species={record.data.species}
        onConfirm={handleDeleteRecord}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
