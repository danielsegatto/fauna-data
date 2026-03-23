import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, PlusCircle, Save, ClipboardList } from "lucide-react";
import {
  Page,
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  EmptyState,
  showToast,
} from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import {
  GROUP_LABELS,
  METHODOLOGIES,
  METHODOLOGY_LABELS,
  type FaunaGroup,
  type SelectOption,
} from "@/lib/types";
import { formatDateTime } from "@/lib/theme";

type FormState = {
  name: string;
  notes: string;
  latitude: string;
  longitude: string;
  accuracy: string;
  group: FaunaGroup;
  methodology: string;
};

const GROUP_OPTIONS: SelectOption[] = [
  { label: GROUP_LABELS.birds, value: "birds" },
  { label: GROUP_LABELS.mammals, value: "mammals" },
  { label: GROUP_LABELS.herpetofauna, value: "herpetofauna" },
];

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function CollectionPointDetailPage() {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();

  const { collectionPoints, isLoading, updateCollectionPoint } = useCollectionPoints();
  const { filterRecords } = useRecords();

  const point = useMemo(
    () => collectionPoints.find((item) => item.id === pointId),
    [collectionPoints, pointId]
  );

  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState("");
  const [methodologyError, setMethodologyError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const buildFormFromPoint = (targetPoint: NonNullable<typeof point>): FormState => ({
    name: targetPoint.name,
    notes: targetPoint.notes ?? "",
    latitude: targetPoint.latitude !== undefined ? String(targetPoint.latitude) : "",
    longitude: targetPoint.longitude !== undefined ? String(targetPoint.longitude) : "",
    accuracy: targetPoint.accuracy !== undefined ? String(targetPoint.accuracy) : "",
    group: targetPoint.group,
    methodology: targetPoint.methodology,
  });

  useEffect(() => {
    if (!point) return;
    setForm(buildFormFromPoint(point));
    setNameError("");
    setMethodologyError("");
  }, [point]);

  const methodologyOptions = useMemo(() => {
    if (!form) return [] as SelectOption[];

    const baseOptions = (METHODOLOGIES[form.group] ?? []).map((methodology) => ({
      label: methodology.title,
      value: methodology.id,
    }));

    if (!baseOptions.some((item) => item.value === form.methodology) && form.methodology) {
      baseOptions.unshift({
        label: METHODOLOGY_LABELS[form.methodology] ?? form.methodology,
        value: form.methodology,
      });
    }

    return baseOptions;
  }, [form]);

  const pointRecords = point
    ? filterRecords({ collectionPointId: point.id })
    : [];

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (field === "name") setNameError("");
    if (field === "methodology") setMethodologyError("");
  };

  const handleSave = async () => {
    if (!point || !form) return;

    if (!form.name.trim()) {
      setNameError("Nome do ponto é obrigatório");
      return;
    }

    if (!form.methodology.trim()) {
      setMethodologyError("Metodologia é obrigatória");
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
    navigate(`/data-entry/${point.group}/${point.methodology}/${point.id}`, {
      state: { pointName: point.name },
    });
  };

  const handleCancelEdit = () => {
    if (!point) return;
    setForm(buildFormFromPoint(point));
    setNameError("");
    setMethodologyError("");
    setIsEditing(false);
  };

  return (
    <Page
      title="Ponto de Coleta"
      subtitle={point ? point.name : "Detalhes"}
      back="/collection-points"
      actions={
        point && !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-all"
          >
            <Edit3 size={16} />
            Editar
          </button>
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
          )}
        </div>
      }
    >
      <div className="px-4 pt-5 pb-4 flex flex-col gap-4">
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
              <Button variant="secondary" size="sm" onClick={() => navigate("/collection-points")}>
                Voltar para lista
              </Button>
            }
          />
        ) : (
          <>
            <Card padding="md">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Criado em</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateTime(point.createdAt)}
                  </p>
                </div>
                <Badge variant="group" group={point.group}>
                  {GROUP_LABELS[point.group]}
                </Badge>
              </div>
            </Card>

            {isEditing ? (
              <Card padding="md">
                <div className="flex flex-col gap-5">
                  <Input
                    label="Nome do Ponto *"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    error={nameError}
                  />

                  <Textarea
                    label="Observações"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={3}
                  />

                  <Select
                    label="Grupo"
                    options={GROUP_OPTIONS}
                    value={form.group}
                    onChange={(value) => {
                      const newGroup = value as FaunaGroup;
                      const nextMethodology = METHODOLOGIES[newGroup]?.[0]?.id ?? "";
                      set("group", newGroup);
                      if (!METHODOLOGIES[newGroup]?.some((m) => m.id === form.methodology)) {
                        set("methodology", nextMethodology);
                      }
                    }}
                  />

                  <Select
                    label="Metodologia *"
                    options={methodologyOptions}
                    value={form.methodology}
                    onChange={(value) => set("methodology", value)}
                    error={methodologyError}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Latitude"
                      value={form.latitude}
                      onChange={(e) => set("latitude", e.target.value)}
                      inputMode="decimal"
                      placeholder="Ex: -10.123456"
                    />
                    <Input
                      label="Longitude"
                      value={form.longitude}
                      onChange={(e) => set("longitude", e.target.value)}
                      inputMode="decimal"
                      placeholder="Ex: -48.654321"
                    />
                  </div>

                  <Input
                    label="Precisão (m)"
                    value={form.accuracy}
                    onChange={(e) => set("accuracy", e.target.value)}
                    inputMode="decimal"
                    placeholder="Ex: 8"
                  />
                </div>
              </Card>
            ) : (
              <Card padding="md">
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Nome</p>
                    <p className="text-sm font-semibold text-gray-900">{point.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Metodologia</p>
                    <p className="text-sm text-gray-700">
                      {METHODOLOGY_LABELS[point.methodology] ?? point.methodology}
                    </p>
                  </div>
                  {point.notes && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Observações</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{point.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card padding="md">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList size={18} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">Registros deste ponto</p>
              </div>

              {pointRecords.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum registro vinculado ainda.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pointRecords.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => navigate(`/records/${record.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 active:scale-[0.99] transition-all"
                    >
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {record.data.species}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateTime(record.timestamp)} • {record.data.identification}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </Page>
  );
}
