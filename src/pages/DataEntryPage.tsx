import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Page, Button, showToast } from "@/components/ui";
import { DataEntryContextCard } from "@/components/records/DataEntryContextCard";
import { DataEntryFormCard } from "@/components/records/DataEntryFormCard";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { RecordsListCard } from "@/components/records/RecordsListCard";
import { PageContent } from "@/components/shared/PageContent";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useDeleteDialog } from "@/hooks/useDeleteDialog";
import { useEnvironmentOptions } from "@/hooks/useEnvironmentOptions";
import { useRecordForm } from "@/hooks/useRecordForm";
import { useRecords } from "@/hooks/useRecords";
import { isMackinnonMethodology, hasMackinnonPointReachedLimit } from "@/lib/mackinnon";
import {
  emptyRecordForm,
  recordFormToObservationData,
} from "@/lib/recordForm";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  type FaunaGroup,
} from "@/lib/types";

export default function DataEntryPage() {
  const { group, methodology, pointId } = useParams<{
    group: string;
    methodology: string;
    pointId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const faunaGroup = group as FaunaGroup;
  const groupLabel = GROUP_LABELS[faunaGroup] ?? group;
  const methodologyLabel = METHODOLOGY_LABELS[methodology ?? ""] ?? methodology;
  const pointName = (location.state as { pointName?: string } | null)?.pointName;
  const backToCollectionPoint = pointId ? `/collection-point/${pointId}` : true;

  const { collectionPoints, isLoading: isLoadingPoints } = useCollectionPoints();
  const { saveRecord, hasSpeciesRecordedAtPoint, filterRecords, deleteRecord } = useRecords();
  const collectionPoint = collectionPoints.find((item) => item.id === pointId);
  const isMackinnonPoint = isMackinnonMethodology(collectionPoint?.methodology ?? methodology);

  const { form, errors, setField, resetForm, validate } = useRecordForm();
  const environmentOptions = useEnvironmentOptions();
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const { isOpen: deleteOpen, itemId: recordToDelete, open: openDelete, close: closeDelete } = useDeleteDialog<string>();

  const persistRecord = async () => {
    setIsSaving(true);
    try {
      await saveRecord({
        collectionPointId: pointId ?? "",
        group: faunaGroup,
        methodology: methodology ?? "",
        data: recordFormToObservationData(form),
      });

      setSavedCount((count) => count + 1);
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
      closeDelete();
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
      const pointRecordCount = filterRecords({ collectionPointId: collectionPoint.id }).length;
      if (hasMackinnonPointReachedLimit(pointRecordCount, collectionPoint.limit)) {
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
      <PageContent>
        <DataEntryContextCard
          group={faunaGroup}
          pointId={pointId}
          pointName={pointName ?? collectionPoint?.name}
          savedCount={savedCount}
        />

        <DataEntryFormCard
          form={form}
          errors={errors}
          group={faunaGroup}
          environmentOptions={environmentOptions}
          onFieldChange={setField}
          collectionPointId={collectionPoint?.id}
          enableSpeciesDuplicateCheck={isMackinnonPoint}
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
            openDelete(recordId);
          }}
        />
      </PageContent>

      <RecordDeleteDialog
        isOpen={deleteOpen}
        species={selectedRecord?.data.species}
        onConfirm={handleDeleteRecord}
        onCancel={closeDelete}
      />
    </Page>
  );
}
