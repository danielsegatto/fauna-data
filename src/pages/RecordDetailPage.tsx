import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Pencil, CheckCircle, X } from "lucide-react";
import {
  Page,
  Card,
  Badge,
  Input,
  Textarea,
  Select,
  Button,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { useRecords } from "@/hooks/useRecords";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import {
  isMackinnonMethodology,
  normalizeSpeciesName,
} from "@/lib/mackinnon";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  IDENTIFICATION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  STRATUM_OPTIONS,
  ACTIVITY_OPTIONS,
  SIDE_OPTIONS,
  type IdentificationType,
  type EnvironmentType,
  type StratumType,
  type ActivityType,
  type SideType,
} from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import {
  hasRecordFormChanges,
  validateRecordForm,
  type RecordFormErrors,
  type RecordFormState,
} from "@/lib/recordForm";
import { theme } from "@/lib/theme";

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();

  const { records, updateRecord, hasSpeciesRecordedAtPoint } = useRecords();
  const { collectionPoints } = useCollectionPoints();

  const record = records.find((r) => r.id === recordId);
  const collectionPoint = record
    ? collectionPoints.find((point) => point.id === record.collectionPointId)
    : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<RecordFormState | null>(null);
  const [errors, setErrors] = useState<RecordFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  // Populate form when entering edit mode
  useEffect(() => {
    if (isEditing && record) {
      setForm({
        species: record.data.species,
        identification: record.data.identification,
        environment: record.data.environment,
        stratum: record.data.stratum,
        activity: record.data.activity,
        quantity: String(record.data.quantity),
        distance: String(record.data.distance),
        side: record.data.side,
        observations: record.data.observations,
      });
      setErrors({});
    }
  }, [isEditing, record]);

  const set = <K extends keyof RecordFormState>(field: K, value: string) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const persistRecordUpdate = async () => {
    if (!form || !record) return;

    setIsSaving(true);
    try {
      await updateRecord(record.id, {
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
      showToast("success", "Registro atualizado com sucesso!");
      setIsEditing(false);
    } catch {
      showToast("error", "Erro ao atualizar registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form || !record) return;

    const errs = validateRecordForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
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
      setDuplicateDialogOpen(true);
      return;
    }

    await persistRecordUpdate();
  };

  const handleCancelEdit = () => {
    // If form was touched, ask for confirmation
    if (form && record) {
      const dirty = hasRecordFormChanges(form, {
        species: record.data.species,
        identification: record.data.identification,
        environment: record.data.environment,
        stratum: record.data.stratum,
        activity: record.data.activity,
        quantity: String(record.data.quantity),
        distance: String(record.data.distance),
        side: record.data.side,
        observations: record.data.observations,
      });
      if (dirty) { setDiscardOpen(true); return; }
    }
    setIsEditing(false);
  };

  // ─── Not found ──────────────────────────────────────────────────────────────

  if (!record) {
    return (
      <Page title="Registro" back="/records">
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-gray-400">Registro não encontrado.</p>
        </div>
      </Page>
    );
  }

  const { color } = theme.groups[record.group] ?? theme.groups.birds;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Page
        title={isEditing ? "Editar Registro" : record.data.species}
        subtitle={`${GROUP_LABELS[record.group]} — ${METHODOLOGY_LABELS[record.methodology] ?? record.methodology}`}
        back={isEditing ? undefined : "/records"}
        actions={
          !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-all"
            >
              <Pencil size={15} />
              Editar
            </button>
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
        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">

          {/* Meta card */}
          <Card padding="md">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium">Data e hora</p>
                <p className="text-xs font-semibold text-gray-700">
                  {formatDateTime(record.timestamp)}
                </p>
              </div>
              {collectionPoint?.name && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-medium">Ponto de Coleta</p>
                  <p className="text-xs font-semibold text-gray-700 truncate max-w-[60%] text-right">
                    {collectionPoint.name}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium">Identificação</p>
                <Badge variant="primary">{record.data.identification}</Badge>
              </div>
            </div>
          </Card>

          {/* View mode */}
          {!isEditing && (
            <Card padding="md">
              <div className="flex flex-col gap-4">
                {/* Species */}
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Espécie
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {record.data.species}
                  </p>
                </div>

                {/* Data grid */}
                <div className="grid grid-cols-2 gap-3">
                  <ViewField label="Ambiente" value={record.data.environment} />
                  <ViewField label="Estrato" value={record.data.stratum} />
                  <ViewField label="Atividade" value={record.data.activity} />
                  <ViewField label="Lado" value={record.data.side} />
                  <ViewField label="Quantidade" value={String(record.data.quantity)} />
                  <ViewField label="Distância" value={`${record.data.distance} m`} />
                </div>

                {/* Observations */}
                {record.data.observations && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                      Observações
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {record.data.observations}
                    </p>
                  </div>
                )}
              </div>

              {/* Group accent */}
              <div
                className="h-1 w-full rounded-b-2xl mt-4 opacity-40"
                style={{ backgroundColor: color }}
              />
            </Card>
          )}

          {/* Edit mode */}
          {isEditing && form && (
            <Card padding="md">
              <div className="flex flex-col gap-5">
                <Input
                  label="Espécie *"
                  value={form.species}
                  onChange={(e) => set("species", e.target.value)}
                  error={errors.species}
                />
                <Select
                  label="Identificação *"
                  options={IDENTIFICATION_OPTIONS}
                  value={form.identification}
                  onChange={(v) => set("identification", v)}
                  error={errors.identification}
                />
                <Select
                  label="Ambiente *"
                  options={ENVIRONMENT_OPTIONS}
                  value={form.environment}
                  onChange={(v) => set("environment", v)}
                  error={errors.environment}
                />
                <Select
                  label="Estrato"
                  options={STRATUM_OPTIONS}
                  value={form.stratum}
                  onChange={(v) => set("stratum", v)}
                  error={errors.stratum}
                />
                <Select
                  label="Atividade"
                  options={ACTIVITY_OPTIONS}
                  value={form.activity}
                  onChange={(v) => set("activity", v)}
                  error={errors.activity}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Quantidade *"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    inputMode="numeric"
                    error={errors.quantity}
                  />
                  <Input
                    label="Distância (m)"
                    value={form.distance}
                    onChange={(e) => set("distance", e.target.value)}
                    inputMode="numeric"
                    error={errors.distance}
                  />
                </div>
                <Select
                  label="Lado"
                  options={SIDE_OPTIONS}
                  value={form.side}
                  onChange={(v) => set("side", v)}
                  error={errors.side}
                />
                <Textarea
                  label="Observações (opcional)"
                  value={form.observations}
                  onChange={(e) => set("observations", e.target.value)}
                  rows={3}
                />
              </div>
            </Card>
          )}
        </div>
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
      <ConfirmDialog
        isOpen={duplicateDialogOpen}
        title="Espécie já registrada"
        message="Esta espécie já foi registrada neste ponto de coleta. Deseja salvar assim mesmo?"
        confirmLabel="Salvar assim mesmo"
        cancelLabel="Não salvar"
        variant="primary"
        onConfirm={() => {
          setDuplicateDialogOpen(false);
          void persistRecordUpdate();
        }}
        onCancel={() => setDuplicateDialogOpen(false)}
      />
    </>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
    </div>
  );
}
