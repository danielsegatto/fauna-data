import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Navigation, PlusCircle, X } from "lucide-react";
import { Page, Button, Input, showToast } from "@/components/ui";
import { useGeolocation } from "@/hooks/useGeolocation";
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

  const scrollToTop = () => {
    const mainContainer = document.querySelector("main");
    if (mainContainer instanceof HTMLElement) {
      mainContainer.scrollTop = 0;
      mainContainer.scrollTo({ top: 0, behavior: "auto" });
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });

    window.requestAnimationFrame(() => {
      if (mainContainer instanceof HTMLElement) {
        mainContainer.scrollTop = 0;
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  useEffect(() => {
    scrollToTop();
  }, [group, methodology, pointId]);

  const { position: gpsPosition, isLoading: isCapturing, error: gpsError, capture: captureGps, clear: clearGps } = useGeolocation();
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [locationSource, setLocationSource] = useState<"gps" | "manual" | null>(null);

  const resolvedLat = locationSource === "gps" ? gpsPosition?.latitude : (manualLat ? Number(manualLat) : undefined);
  const resolvedLng = locationSource === "gps" ? gpsPosition?.longitude : (manualLng ? Number(manualLng) : undefined);
  const resolvedAccuracy = locationSource === "gps" ? (gpsPosition?.accuracy ?? undefined) : undefined;
  const hasLocation = locationSource === "gps"
    ? gpsPosition !== null
    : locationSource === "manual" && manualLat.trim() !== "" && manualLng.trim() !== "";

  const persistRecord = async () => {
    setIsSaving(true);
    try {
      await saveRecord({
        collectionPointId: pointId ?? "",
        group: faunaGroup,
        methodology: methodology ?? "",
        data: recordFormToObservationData(form),
        latitude: (hasLocation && Number.isFinite(resolvedLat)) ? resolvedLat : undefined,
        longitude: (hasLocation && Number.isFinite(resolvedLng)) ? resolvedLng : undefined,
        accuracy: resolvedAccuracy,
      });

      setSavedCount((count) => count + 1);
      resetForm(emptyRecordForm);
      // Keep location state so consecutive records can share the same coords
      showToast("success", "Registro salvo! Pronto para novo registro.");

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      scrollToTop();
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
                      setManualLat("");
                      setManualLng("");
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
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    inputMode="decimal"
                    placeholder="-10.123456"
                  />
                  <Input
                    label="Longitude"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    inputMode="decimal"
                    placeholder="-48.456789"
                  />
                </div>
              )}

              {locationSource !== null && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 text-xs text-gray-400 font-medium"
                  onClick={() => {
                    setLocationSource(null);
                    clearGps();
                    setManualLat("");
                    setManualLng("");
                  }}
                >
                  <X size={12} />
                  Limpar localização
                </button>
              )}
            </div>
          }
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
