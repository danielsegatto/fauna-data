import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, PlusCircle } from "lucide-react";
import {
  Page,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  showToast,
} from "@/components/ui";
import { useRecords } from "@/hooks/useRecords";
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
import { theme } from "@/lib/theme";

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = {
  species: "",
  identification: "" as IdentificationType | "",
  environment: "" as EnvironmentType | "",
  stratum: "" as StratumType | "",
  activity: "" as ActivityType | "",
  quantity: "",
  distance: "",
  side: "" as SideType | "",
  observations: "",
};

type FormState = typeof emptyForm;
type FormErrors = Partial<Record<keyof FormState, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.species.trim()) errors.species = "Espécie é obrigatória";
  if (!form.identification) errors.identification = "Identificação é obrigatória";
  if (!form.environment) errors.environment = "Ambiente é obrigatório";

  if (!form.quantity) {
    errors.quantity = "Quantidade é obrigatória";
  } else if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
    errors.quantity = "Deve ser um número positivo";
  }

  if (form.distance && (isNaN(Number(form.distance)) || Number(form.distance) < 0)) {
    errors.distance = "Deve ser um número ≥ 0";
  }

  return errors;
}

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

  const { saveRecord } = useRecords();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Generic field updater
  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast("error", "Preencha todos os campos obrigatórios");
      return;
    }

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
      setForm(emptyForm);
      setErrors({});
      showToast("success", "Registro salvo! Pronto para novo registro.");
    } catch {
      showToast("error", "Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Page
      title="Entrada de Dados"
      subtitle={`${groupLabel} — ${methodologyLabel}`}
      back
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
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Voltar ao Ponto de Coleta
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
                {pointName ?? pointId}
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
            <Input
              label="Espécie *"
              placeholder="Ex: Araçari-de-bico-preto"
              value={form.species}
              onChange={(e) => set("species", e.target.value)}
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
      </div>
    </Page>
  );
}
