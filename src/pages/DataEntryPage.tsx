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
import {
  SpeciesField,
  IdentificationToggle,
  EnvironmentField,
  StratumField,
  ActivityField,
  QuantityStepper,
  DistanceStepper,
  SideGrid,
  ObservationsField,
} from "@/components/records/RecordFormFields";
import { RecordListItem } from "@/components/records/RecordListItem";
import { isMackinnonMethodology, hasMackinnonPointReachedLimit } from "@/lib/mackinnon";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  ENVIRONMENT_OPTIONS,
  STRATUM_OPTIONS,
  ACTIVITY_OPTIONS,
  type FaunaGroup,
  type StratumType,
  type ActivityType,
  type SideType,
} from "@/lib/types";
import {
  emptyRecordForm,
  recordFormToObservationData,
} from "@/lib/recordForm";
import { theme } from "@/lib/theme";
import { formatDateTime } from "@/lib/format";
const ENVIRONMENT_OPTIONS_WITHOUT_OTHER = ENVIRONMENT_OPTIONS.filter((option) => option.value !== "outro");


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

  const isAudioSelected = form.identification === "A" || form.identification === "AV";
  const isVisualSelected = form.identification === "V" || form.identification === "AV";

  const toggleIdentification = (channel: "A" | "V") => {
    const nextAudio = channel === "A" ? !isAudioSelected : isAudioSelected;
    const nextVisual = channel === "V" ? !isVisualSelected : isVisualSelected;

    let nextValue = "";
    if (nextAudio && nextVisual) nextValue = "AV";
    else if (nextAudio) nextValue = "A";
    else if (nextVisual) nextValue = "V";

    setField("identification", nextValue);
  };

  const adjustQuantity = (delta: number) => {
    const current = Number(form.quantity);
    const safeCurrent = Number.isFinite(current) && current > 0 ? current : 0;
    const nextValue = Math.max(1, safeCurrent + delta);
    setField("quantity", String(nextValue));
  };

  const DISTANCE_PRESETS = [1, 5, 10, 20, 50];

  const adjustDistance = (delta: number) => {
    const current = Number(form.distance);
    const safeCurrent = Number.isFinite(current) && current >= 0 ? current : 0;
    const next = Math.max(0, safeCurrent + delta);
    setField("distance", String(next));
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

        {/* Form */}
        <Card padding="md">
          <div className="flex flex-col gap-5">
            <SpeciesField
              group={faunaGroup}
              value={form.species}
              onChange={(value) => setField("species", value)}
              error={errors.species}
              placeholder="Ex: Araçari-de-bico-preto"
            />

            <IdentificationToggle
              value={form.identification}
              isAudioSelected={isAudioSelected}
              isVisualSelected={isVisualSelected}
              onAudioChange={() => toggleIdentification("A")}
              onVisualChange={() => toggleIdentification("V")}
              error={errors.identification}
            />

            <EnvironmentField
              value={form.environment}
              onChange={(value) => setField("environment", value)}
              options={ENVIRONMENT_OPTIONS_WITHOUT_OTHER}
              error={errors.environment}
            />

            <StratumField
              value={form.stratum}
              onChange={(v) => setField("stratum", v as StratumType)}
              options={STRATUM_OPTIONS}
              error={errors.stratum}
            />

            <ActivityField
              value={form.activity}
              onChange={(v) => setField("activity", v as ActivityType)}
              options={ACTIVITY_OPTIONS}
              error={errors.activity}
            />

            {/* Quantidade + Distância side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuantityStepper
                value={form.quantity}
                onChange={(value) => setField("quantity", value)}
                onDecrease={() => adjustQuantity(-1)}
                onIncrease={() => adjustQuantity(1)}
                error={errors.quantity}
              />

              <DistanceStepper
                value={form.distance}
                onChange={(value) => setField("distance", value)}
                onDecrease={() => adjustDistance(-1)}
                onIncrease={() => adjustDistance(1)}
                onClear={() => setField("distance", "")}
                presets={DISTANCE_PRESETS}
                error={errors.distance}
              />
            </div>

            <SideGrid
              value={form.side}
              onChange={(value) => setField("side", value as SideType)}
              onClear={() => setField("side", "")}
              error={errors.side}
            />

            <ObservationsField
              value={form.observations}
              onChange={(value) => setField("observations", value)}
            />
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Registros deste ponto</p>
              <p className="text-xs text-gray-400">Toque em um registro para editar ou remover.</p>
            </div>
          </div>

          {pointRecords.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum registro vinculado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pointRecords.map((record) => (
                <RecordListItem
                  key={record.id}
                  record={record}
                  metaLabel={`${formatDateTime(record.timestamp)} • ${record.data.identification}`}
                  onOpen={(recordId) => {
                    navigate(`/records/${recordId}`, {
                      state: { backTo: `/collection-point/${record.collectionPointId}` },
                    });
                  }}
                  onDelete={(recordId) => {
                    setRecordToDelete(recordId);
                    setDeleteOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </Card>
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
