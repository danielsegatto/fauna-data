import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, PlusCircle, Save, ClipboardList, FileDown } from "lucide-react";
import {
  Page,
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  EmptyState,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import { useExport } from "@/hooks/useExport";
import { RecordListItem } from "@/components/records/RecordListItem";
import {
  isMackinnonMethodology,
  parseMackinnonLimit,
  hasMackinnonPointReachedLimit,
} from "@/lib/mackinnon";
import { MackinnonLimitField } from "@/components/collection-points/MackinnonLimitField";
import {
  GROUP_LABELS,
  METHODOLOGIES,
  METHODOLOGY_LABELS,
  type FaunaGroup,
  type SelectOption,
} from "@/lib/types";
import { formatDateTime } from "@/lib/format";

type FormState = {
  name: string;
  notes: string;
  latitude: string;
  longitude: string;
  accuracy: string;
  limit: string;
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
  const { records, filterRecords, deleteRecord } = useRecords();
  const { isExporting, exportCSV } = useExport();

  const point = useMemo(
    () => collectionPoints.find((item) => item.id === pointId),
    [collectionPoints, pointId]
  );

  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState("");
  const [methodologyError, setMethodologyError] = useState("");
  const [limitError, setLimitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const buildFormFromPoint = (targetPoint: NonNullable<typeof point>): FormState => ({
    name: targetPoint.name,
    notes: targetPoint.notes ?? "",
    latitude: targetPoint.latitude !== undefined ? String(targetPoint.latitude) : "",
    longitude: targetPoint.longitude !== undefined ? String(targetPoint.longitude) : "",
    accuracy: targetPoint.accuracy !== undefined ? String(targetPoint.accuracy) : "",
    limit: targetPoint.limit !== undefined ? String(targetPoint.limit) : "",
    group: targetPoint.group,
    methodology: targetPoint.methodology,
  });

  useEffect(() => {
    if (!point) return;
    setForm(buildFormFromPoint(point));
    setNameError("");
    setMethodologyError("");
    setLimitError("");
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

  const pointMap = useMemo(() => {
    if (!point) return {} as Record<string, string>;
    return { [point.id]: point.name };
  }, [point]);

  const isAtLimit = !isEditing
    && isMackinnonMethodology(point?.methodology)
    && hasMackinnonPointReachedLimit(pointRecords.length, point?.limit);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (field === "name") setNameError("");
    if (field === "methodology") setMethodologyError("");
    if (field === "limit") setLimitError("");
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

    const parsedLimit = parseMackinnonLimit(form.limit);
    if (isMackinnonMethodology(form.methodology) && parsedLimit === undefined) {
      setLimitError("Informe um limite inteiro maior que zero");
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
        limit: isMackinnonMethodology(form.methodology) ? parsedLimit : undefined,
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
    if (isMackinnonMethodology(point.methodology) && point.limit === undefined) {
      showToast("error", "Defina o limite da Lista de Mackinnon antes de adicionar registros.");
      setForm(buildFormFromPoint(point));
      setLimitError("Defina um limite antes de continuar");
      setIsEditing(true);
      return;
    }

    if (isAtLimit) {
      showToast("warning", "Limite alcançado. Inicie um novo ponto de coleta.");
      return;
    }

    navigate(`/data-entry/${point.group}/${point.methodology}/${point.id}`, {
      state: { pointName: point.name },
    });
  };

  const handleCancelEdit = () => {
    if (!point) return;
    setForm(buildFormFromPoint(point));
    setNameError("");
    setMethodologyError("");
    setLimitError("");
    setIsEditing(false);
  };

  const handleExportPointRecords = async () => {
    if (!point) return;

    const count = await exportCSV(
      records,
      {
        group: "",
        collectionPointId: point.id,
        startDate: "",
        endDate: "",
      },
      pointMap
    );

    if (count === 0) {
      showToast("warning", "Nenhum registro encontrado para este ponto de coleta.");
      return;
    }

    showToast(
      "success",
      `${count} registro${count !== 1 ? "s" : ""} exportado${count !== 1 ? "s" : ""}!`
    );
  };

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

  return (
    <>
      <Page
      title="Ponto de Coleta"
      subtitle={point ? point.name : "Detalhes"}
      back={point ? `/collection-points/${point.group}` : "/"}
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
            <>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                icon={<FileDown size={18} />}
                loading={isExporting}
                onClick={handleExportPointRecords}
                disabled={!point || pointRecords.length === 0}
              >
                Exportar Registros deste Ponto
              </Button>
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
              {isAtLimit && point && (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  icon={<PlusCircle size={18} />}
                  onClick={() => navigate(`/methodologies/${point.group}`)}
                >
                  Criar Novo Ponto de Coleta
                </Button>
              )}
            </>
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
              <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
                Voltar ao início
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

                  {isMackinnonMethodology(form.methodology) && (
                    <MackinnonLimitField
                      value={form.limit}
                      onChange={(v) => set("limit", v)}
                      error={limitError}
                    />
                  )}

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
                  {isMackinnonMethodology(point.methodology) && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Limite Mackinnon</p>
                      <p className="text-sm text-gray-700">
                        {point.limit !== undefined ? `${pointRecords.length}/${point.limit} registros` : "Não definido"}
                      </p>
                    </div>
                  )}
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
                <div>
                  <p className="text-sm font-semibold text-gray-700">Registros deste ponto</p>
                  {isMackinnonMethodology(point.methodology) && point.limit !== undefined && (
                    <p className="text-xs text-gray-400">Progresso atual: {pointRecords.length}/{point.limit}</p>
                  )}
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
                          state: { backTo: `/collection-point/${point.id}` },
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
          </>
        )}
      </div>
    </Page>

    {/* Delete confirmation */}
    <ConfirmDialog
      isOpen={deleteOpen}
      title="Remover Registro"
      message={recordToDelete && pointRecords.find(r => r.id === recordToDelete) ? `Você tem certeza que deseja remover o registro de ${pointRecords.find(r => r.id === recordToDelete)?.data.species}? Esta ação não pode ser desfeita.` : "Você tem certeza que deseja remover este registro? Esta ação não pode ser desfeita."}
      confirmLabel="Remover"
      cancelLabel="Cancelar"
      variant="danger"
      onConfirm={handleDeleteRecord}
      onCancel={() => {
        setDeleteOpen(false);
        setRecordToDelete(null);
      }}
    />
    </>
  );
}
