import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Minus,
  Plus,
  PlusCircle,
  Trash2,
  Volume2,
  Eye,
} from "lucide-react";
import {
  Page,
  Textarea,
  OptionGroup,
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
  ENVIRONMENT_OPTIONS,
  STRATUM_OPTIONS,
  ACTIVITY_OPTIONS,
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
import { cn, theme } from "@/lib/theme";
import { formatDateTime } from "@/lib/format";

const normalizeText = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

const ENVIRONMENT_OPTIONS_WITHOUT_OTHER = ENVIRONMENT_OPTIONS.filter((option) => option.value !== "outro");

const environmentValueByKey = ENVIRONMENT_OPTIONS_WITHOUT_OTHER.reduce<Record<string, string>>((acc, option) => {
  acc[normalizeText(option.label)] = option.value;
  acc[normalizeText(option.value)] = option.value;
  return acc;
}, {});



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

  const isAudioSelected = form.identification === "A" || form.identification === "AV";
  const isVisualSelected = form.identification === "V" || form.identification === "AV";

  const toggleIdentification = (channel: "A" | "V") => {
    const nextAudio = channel === "A" ? !isAudioSelected : isAudioSelected;
    const nextVisual = channel === "V" ? !isVisualSelected : isVisualSelected;

    let nextValue = "";
    if (nextAudio && nextVisual) nextValue = "AV";
    else if (nextAudio) nextValue = "A";
    else if (nextVisual) nextValue = "V";

    set("identification", nextValue);
  };

  const adjustQuantity = (delta: number) => {
    const current = Number(form.quantity);
    const safeCurrent = Number.isFinite(current) && current > 0 ? current : 0;
    const nextValue = Math.max(1, safeCurrent + delta);
    set("quantity", String(nextValue));
  };

  const DISTANCE_PRESETS = [1, 5, 10, 20, 50];

  const adjustDistance = (delta: number) => {
    const current = Number(form.distance);
    const safeCurrent = Number.isFinite(current) && current >= 0 ? current : 0;
    const next = Math.max(0, safeCurrent + delta);
    set("distance", String(next));
  };

  const environmentDisplayValue = ENVIRONMENT_OPTIONS_WITHOUT_OTHER.find((option) => option.value === form.environment)?.label
    ?? form.environment;

  const setEnvironmentFromInput = (rawValue: string) => {
    const mappedValue = environmentValueByKey[normalizeText(rawValue)];
    set("environment", mappedValue ?? rawValue);
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
              group={faunaGroup}
              label="Espécie *"
              placeholder="Ex: Araçari-de-bico-preto"
              value={form.species}
              onChange={(value) => set("species", value)}
              error={errors.species}
            />

            {/* Identificação */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Identificação *</label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Identificação">
                <button
                  type="button"
                  onClick={() => toggleIdentification("A")}
                  aria-pressed={isAudioSelected}
                  className={cn(
                    "w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "active:scale-95 transition-all duration-150 select-none",
                    "flex items-center justify-center gap-2",
                    isAudioSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                    errors.identification && !isAudioSelected && "border-red-200"
                  )}
                >
                  <Volume2 size={16} aria-hidden="true" />
                  <span>Auditivo (A)</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleIdentification("V")}
                  aria-pressed={isVisualSelected}
                  className={cn(
                    "w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "active:scale-95 transition-all duration-150 select-none",
                    "flex items-center justify-center gap-2",
                    isVisualSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                    errors.identification && !isVisualSelected && "border-red-200"
                  )}
                >
                  <Eye size={16} aria-hidden="true" />
                  <span>Visual (V)</span>
                </button>
              </div>
              {errors.identification && (
                <p className="text-xs font-medium text-red-500">{errors.identification}</p>
              )}
            </div>

            {/* Ambiente */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ambiente" className="text-sm font-semibold text-gray-700">Ambiente *</label>
              <input
                id="ambiente"
                list="ambiente-suggestions"
                placeholder="Ex: Floresta"
                value={environmentDisplayValue}
                onChange={(e) => setEnvironmentFromInput(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
                  errors.environment ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
                )}
              />
              <datalist id="ambiente-suggestions">
                {ENVIRONMENT_OPTIONS_WITHOUT_OTHER.map((option) => (
                  <option key={option.value} value={option.label} />
                ))}
              </datalist>
              {errors.environment && <p className="text-xs font-medium text-red-500">{errors.environment}</p>}
            </div>

            {/* Estrato */}
            <OptionGroup
              label="Estrato"
              options={STRATUM_OPTIONS}
              value={form.stratum}
              onChange={(v) => set("stratum", v as StratumType)}
              error={errors.stratum}
              allowClear
            />

            {/* Atividade */}
            <OptionGroup
              label="Atividade"
              options={ACTIVITY_OPTIONS}
              value={form.activity}
              onChange={(v) => set("activity", v as ActivityType)}
              error={errors.activity}
              allowClear
            />

            {/* Quantidade + Distância side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quantidade" className="text-sm font-semibold text-gray-700">Quantidade *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(-1)}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} className="shrink-0" aria-hidden="true" />
                  </button>

                  <input
                    id="quantidade"
                    className={cn(
                      "flex-1 min-w-0 px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400 text-center",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
                      errors.quantity ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
                    )}
                    type="tel"
                    placeholder="Ex: 1"
                    value={form.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />

                  <button
                    type="button"
                    onClick={() => adjustQuantity(1)}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} className="shrink-0" aria-hidden="true" />
                  </button>
                </div>
                {errors.quantity && <p className="text-xs font-medium text-red-500">{errors.quantity}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="distancia" className="text-sm font-semibold text-gray-700">Distância (m)</label>
                  {form.distance && (
                    <button
                      type="button"
                      onClick={() => set("distance", "")}
                      className="text-xs font-semibold text-gray-500 active:text-gray-700"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Presets */}
                <div className="flex gap-1.5">
                  {DISTANCE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => set("distance", String(preset))}
                      className={cn(
                        "flex-1 min-h-[36px] rounded-xl border text-xs font-semibold",
                        "focus:outline-none focus:ring-2 focus:ring-primary/40",
                        "active:scale-95 transition-all duration-150 select-none",
                        form.distance === String(preset)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 bg-gray-50 text-gray-600 active:bg-gray-100"
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Stepper + typed input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustDistance(-1)}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
                    aria-label="Diminuir distância"
                  >
                    <Minus size={16} className="shrink-0" aria-hidden="true" />
                  </button>

                  <input
                    id="distancia"
                    className={cn(
                      "flex-1 min-w-0 px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400 text-center",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
                      errors.distance ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
                    )}
                    type="tel"
                    placeholder="m"
                    value={form.distance}
                    onChange={(e) => set("distance", e.target.value)}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />

                  <button
                    type="button"
                    onClick={() => adjustDistance(1)}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
                    aria-label="Aumentar distância"
                  >
                    <Plus size={16} className="shrink-0" aria-hidden="true" />
                  </button>
                </div>

                {errors.distance && <p className="text-xs font-medium text-red-500">{errors.distance}</p>}
              </div>
            </div>

            {/* Lado */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-semibold text-gray-700">Lado</label>
                {form.side && (
                  <button
                    type="button"
                    onClick={() => set("side", "")}
                    className="text-xs font-semibold text-gray-500 active:text-gray-700"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 grid-rows-3 gap-2" role="radiogroup" aria-label="Lado">
                <button
                  type="button"
                  role="radio"
                  aria-checked={form.side === "frente"}
                  onClick={() => set("side", "frente" as SideType)}
                  className={cn(
                    "col-start-2 row-start-1 w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "active:scale-95 transition-all duration-150 select-none",
                    "flex items-center justify-center gap-2",
                    form.side === "frente"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                    errors.side && form.side !== "frente" && "border-red-200"
                  )}
                >
                  <ArrowUp size={16} className="shrink-0" aria-hidden="true" />
                  <span>Frente</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={form.side === "esquerda"}
                  onClick={() => set("side", "esquerda" as SideType)}
                  className={cn(
                    "col-start-1 row-start-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "active:scale-95 transition-all duration-150 select-none",
                    "flex items-center justify-center gap-2",
                    form.side === "esquerda"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                    errors.side && form.side !== "esquerda" && "border-red-200"
                  )}
                >
                  <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
                  <span>Esquerda</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={form.side === "direita"}
                  onClick={() => set("side", "direita" as SideType)}
                  className={cn(
                    "col-start-3 row-start-2 w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "active:scale-95 transition-all duration-150 select-none",
                    "flex items-center justify-center gap-2",
                    form.side === "direita"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                    errors.side && form.side !== "direita" && "border-red-200"
                  )}
                >
                  <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
                  <span>Direita</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={form.side === "tras"}
                  onClick={() => set("side", "tras" as SideType)}
                  className={cn(
                    "col-start-2 row-start-3 w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "active:scale-95 transition-all duration-150 select-none",
                    "flex items-center justify-center gap-2",
                    form.side === "tras"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
                    errors.side && form.side !== "tras" && "border-red-200"
                  )}
                >
                  <ArrowDown size={16} className="shrink-0" aria-hidden="true" />
                  <span>Trás</span>
                </button>
              </div>

              {errors.side && <p className="text-xs font-medium text-red-500">{errors.side}</p>}
            </div>

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
