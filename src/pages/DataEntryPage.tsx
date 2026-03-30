import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, PlusCircle, Trash2 } from "lucide-react";
import {
  Page,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import { SpeciesAutocompleteInput } from "@/components/records/SpeciesAutocompleteInput";
import { isMackinnonMethodology, hasMackinnonPointReachedLimit } from "@/lib/mackinnon";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  IDENTIFICATION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  STRATUM_OPTIONS,
  ACTIVITY_OPTIONS,
  SIDE_OPTIONS,
  type FaunaGroup,
  type IdentificationType,
  type EnvironmentType,
  type StratumType,
  type ActivityType,
  type SideType,
} from "@/lib/types";
import {
  emptyRecordForm,
  validateRecordForm,
  type RecordFormErrors,
  type RecordFormState,
} from "@/lib/recordForm";
import { theme } from "@/lib/theme";
import { formatDateTime } from "@/lib/format";

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

  const [form, setForm] = useState<RecordFormState>(emptyRecordForm);
  const [errors, setErrors] = useState<RecordFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Generic field updater
  const set = <K extends keyof RecordFormState>(field: K, value: RecordFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const persistRecord = async () => {
    setIsSaving(true);
    try {
      await saveRecord({
        collectionPointId: pointId ?? "",
        group: faunaGroup,
        methodology: methodology ?? "",
        data: {
          species: form.species.trim(),
          identification: form.identification as IdentificationType,
          environment: form.environment as EnvironmentType,
          stratum: form.stratum as StratumType,
          activity: form.activity as ActivityType,
          quantity: Number(form.quantity),
          distance: Number(form.distance),
          side: form.side as SideType,
          observations: form.observations.trim(),
        },
      });

      setSavedCount((n) => n + 1);
      setForm(emptyRecordForm);
      setErrors({});
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
    const errs = validateRecordForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
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

        {/* Form */}
        <Card padding="md">
          <div className="flex flex-col gap-5">

            {/* Espécie */}
            <SpeciesAutocompleteInput
              label="Espécie *"
              placeholder="Ex: Araçari-de-bico-preto"
              value={form.species}
              onChange={(value) => set("species", value)}
              error={errors.species}
            />

            {/* Identificação */}
            <Select
              label="Identificação *"
              options={IDENTIFICATION_OPTIONS}
              value={form.identification}
              onChange={(v) => set("identification", v as IdentificationType)}
              error={errors.identification}
            />

            {/* Ambiente */}
            <Select
              label="Ambiente *"
              options={ENVIRONMENT_OPTIONS}
              value={form.environment}
              onChange={(v) => set("environment", v as EnvironmentType)}
              error={errors.environment}
            />

            {/* Estrato */}
            <Select
              label="Estrato"
              options={STRATUM_OPTIONS}
              value={form.stratum}
              onChange={(v) => set("stratum", v as StratumType)}
              error={errors.stratum}
            />

            {/* Atividade */}
            <Select
              label="Atividade"
              options={ACTIVITY_OPTIONS}
              value={form.activity}
              onChange={(v) => set("activity", v as ActivityType)}
              error={errors.activity}
            />

            {/* Quantidade + Distância side by side */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantidade *"
                placeholder="Ex: 1"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                inputMode="numeric"
                error={errors.quantity}
              />
              <Input
                label="Distância (m)"
                placeholder="Ex: 15"
                value={form.distance}
                onChange={(e) => set("distance", e.target.value)}
                inputMode="numeric"
                error={errors.distance}
              />
            </div>

            {/* Lado */}
            <Select
              label="Lado"
              options={SIDE_OPTIONS}
              value={form.side}
              onChange={(v) => set("side", v as SideType)}
              error={errors.side}
            />

            {/* Observações */}
            <Textarea
              label="Observações (opcional)"
              placeholder="Notas adicionais sobre a observação..."
              value={form.observations}
              onChange={(e) => set("observations", e.target.value)}
              rows={3}
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
                <div
                  key={record.id}
                  className="flex items-stretch gap-2 group"
                >
                  <button
                    onClick={() =>
                      navigate(`/records/${record.id}`, {
                        state: { backTo: `/collection-point/${record.collectionPointId}` },
                      })
                    }
                    className="flex-1 text-left px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 active:scale-[0.99] transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {record.data.species}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateTime(record.timestamp)} • {record.data.identification}
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecordToDelete(record.id);
                      setDeleteOpen(true);
                    }}
                    className="px-2 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                    title="Deletar registro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
