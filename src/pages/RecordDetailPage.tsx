import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Navigation, X } from "lucide-react";
import {
  Page,
  Button,
  ConfirmDialog,
  showToast,
} from "@/components/ui";
import { Input } from "@/components/ui";
import { useGeolocation } from "@/hooks/useGeolocation";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { RecordFormCard } from "@/components/records/RecordFormCard";
import { RecordMetadataCard } from "@/components/records/RecordMetadataCard";
import { RecordPageActions } from "@/components/records/RecordPageActions";
import { RecordViewCard } from "@/components/records/RecordViewCard";
import { PageContent } from "@/components/shared/PageContent";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useEnvironmentOptions } from "@/hooks/useEnvironmentOptions";
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
  const environmentOptions = useEnvironmentOptions();
  const [isSaving, setIsSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { position: gpsPosition, isLoading: isCapturing, error: gpsError, capture: captureGps, clear: clearGps } = useGeolocation();
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [locationSource, setLocationSource] = useState<"gps" | "manual" | "none">("none");

  const hasEditLocation = locationSource === "gps"
    ? gpsPosition !== null
    : locationSource === "manual" && editLat.trim() !== "" && editLng.trim() !== "";
  const resolvedEditLat = locationSource === "gps" ? gpsPosition?.latitude : (editLat ? Number(editLat) : undefined);
  const resolvedEditLng = locationSource === "gps" ? gpsPosition?.longitude : (editLng ? Number(editLng) : undefined);
  const resolvedEditAccuracy = locationSource === "gps" ? (gpsPosition?.accuracy ?? undefined) : undefined;

  const persistRecordUpdate = async () => {
    if (!record) return;

    setIsSaving(true);
    try {
      await updateRecord(record.id, {
        data: recordFormToObservationData(form),
        latitude: hasEditLocation && Number.isFinite(resolvedEditLat) ? resolvedEditLat : undefined,
        longitude: hasEditLocation && Number.isFinite(resolvedEditLng) ? resolvedEditLng : undefined,
        accuracy: hasEditLocation ? resolvedEditAccuracy : undefined,
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
    // Pre-populate location from the record's existing coords
    if (Number.isFinite(record.latitude) && Number.isFinite(record.longitude)) {
      setEditLat(String(record.latitude));
      setEditLng(String(record.longitude));
      setLocationSource("manual");
    } else {
      setEditLat("");
      setEditLng("");
      setLocationSource("none");
    }
    clearGps();
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
              environmentOptions={environmentOptions}
              onFieldChange={setField}
              collectionPointId={collectionPoint?.id}
              enableSpeciesDuplicateCheck={Boolean(
                collectionPoint && isMackinnonMethodology(collectionPoint.methodology)
              )}
              excludeRecordId={record.id}
              locationSection={
                <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-surface/40 p-4">
                  <p className="text-sm font-semibold text-gray-700">Localização do Registro</p>
                  {locationSource !== "manual" && (
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<Navigation size={16} />}
                      loading={isCapturing}
                      onClick={async () => {
                        const pos = await captureGps();
                        if (pos) {
                          setLocationSource("gps");
                          setEditLat("");
                          setEditLng("");
                          showToast("success", `GPS capturado! Precisão: ±${pos.accuracy?.toFixed(0) ?? "?"}m`);
                        } else if (gpsError) {
                          showToast("error", gpsError);
                        }
                      }}
                    >
                      {locationSource === "gps" && gpsPosition
                        ? `GPS ativo — ±${gpsPosition.accuracy?.toFixed(0) ?? "?"}m`
                        : "Capturar GPS"}
                    </Button>
                  )}

                  {locationSource === "gps" && gpsPosition && (
                    <p className="text-xs font-mono text-gray-500 text-center">
                      {gpsPosition.latitude.toFixed(6)}, {gpsPosition.longitude.toFixed(6)}
                    </p>
                  )}

                  {locationSource !== "gps" && (
                    <button
                      type="button"
                      className="text-xs text-primary font-semibold text-center"
                      onClick={() => {
                        setLocationSource("manual");
                        clearGps();
                      }}
                    >
                      {locationSource === "manual" ? "Editar coordenadas manuais" : "Inserir coordenadas manualmente"}
                    </button>
                  )}

                  {locationSource === "manual" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Latitude"
                        value={editLat}
                        onChange={(e) => setEditLat(e.target.value)}
                        inputMode="decimal"
                        placeholder="-10.123456"
                      />
                      <Input
                        label="Longitude"
                        value={editLng}
                        onChange={(e) => setEditLng(e.target.value)}
                        inputMode="decimal"
                        placeholder="-48.456789"
                      />
                    </div>
                  )}

                  {locationSource !== "none" && (
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1 text-xs text-gray-400 font-medium"
                      onClick={() => {
                        setLocationSource("none");
                        clearGps();
                        setEditLat("");
                        setEditLng("");
                      }}
                    >
                      <X size={12} />
                      Limpar localização
                    </button>
                  )}
                </div>
              }
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
