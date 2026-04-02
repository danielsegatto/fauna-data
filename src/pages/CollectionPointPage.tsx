import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Navigation, CheckCircle, Clock } from "lucide-react";
import { Page, Input, Textarea, Button, Card, showToast } from "@/components/ui";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import {
  isMackinnonMethodology,
  parseMackinnonLimit,
} from "@/lib/mackinnon";
import { MackinnonLimitField } from "@/components/collection-points/MackinnonLimitField";
import { PageContent } from "@/components/shared/PageContent";
import { GROUP_LABELS, METHODOLOGY_LABELS, type FaunaGroup } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { theme } from "@/lib/theme";

export default function CollectionPointPage() {
  const { group, methodology } = useParams<{ group: string; methodology: string }>();
  const navigate = useNavigate();

  const faunaGroup = group as FaunaGroup;
  const { color, bg } = theme.groups[faunaGroup] ?? theme.groups.birds;
  const groupLabel = GROUP_LABELS[faunaGroup] ?? group;
  const methodologyLabel = METHODOLOGY_LABELS[methodology ?? ""] ?? methodology;

  const { saveCollectionPoint } = useCollectionPoints();
  const { position, isLoading: isCapturing, error: gpsError, capture } = useGeolocation();

  // Form state
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [limit, setLimit] = useState("");
  const { errors, setError, clearError, clearAllErrors } = useFormErrors<{ name: string; limit: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [createdAt] = useState(() => Date.now());
  const isMackinnon = isMackinnonMethodology(methodology);

  const handleCapture = async () => {
    const result = await capture();
    if (result) {
      showToast("success", `Localização capturada! Precisão: ±${result.accuracy?.toFixed(0) ?? "?"}m`);
    } else if (gpsError) {
      showToast("error", gpsError);
    }
  };

  const handleContinue = async () => {
    // Validate
    if (!name.trim()) {
      setError("name", "Nome do ponto é obrigatório");
      return;
    }

    const parsedLimit = parseMackinnonLimit(limit);
    if (isMackinnon && parsedLimit === undefined) {
      setError("limit", "Informe um limite inteiro maior que zero");
      return;
    }

    clearAllErrors();
    setIsSaving(true);

    try {
      const point = await saveCollectionPoint({
        name: name.trim(),
        notes: notes.trim() || undefined,
        latitude: position?.latitude,
        longitude: position?.longitude,
        accuracy: position?.accuracy ?? undefined,
        group: faunaGroup,
        methodology: methodology ?? "",
        limit: isMackinnon ? parsedLimit : undefined,
      });

      navigate(`/data-entry/${faunaGroup}/${methodology}/${point.id}`, {
        state: { pointName: point.name },
      });
    } catch {
      showToast("error", "Erro ao salvar ponto de coleta. Tente novamente.");
      setIsSaving(false);
    }
  };

  return (
    <Page
      title="Ponto de Coleta"
      subtitle={`${groupLabel} — ${methodologyLabel}`}
      back
      footer={
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          icon={<CheckCircle size={20} />}
          loading={isSaving}
          onClick={handleContinue}
        >
          Criar Ponto e Continuar
        </Button>
      }
    >
      <PageContent>

        {/* Creation timestamp */}
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Clock size={18} color={color} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Data e hora de criação</p>
              <p className="text-sm font-semibold text-gray-900">{formatDateTime(createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Point name */}
        <Card padding="md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <MapPin size={18} color={color} />
              </div>
              <p className="text-sm font-semibold text-gray-700">Identificação do Ponto</p>
            </div>

            <Input
              label="Nome do Ponto *"
              placeholder="Ex: Ponto A, Trilha Principal, Margem do Rio"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) clearError("name");
              }}
              error={errors.name}
            />

            <Textarea
              label="Observações (opcional)"
              placeholder="Notas sobre o ponto de coleta, acesso, características..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            {isMackinnon && (
              <MackinnonLimitField
                value={limit}
                onChange={(v) => {
                  setLimit(v);
                  clearError("limit");
                }}
                error={errors.limit}
              />
            )}
          </div>
        </Card>

        {/* GPS */}
        <Card padding="md">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Navigation size={18} color={color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Localização GPS</p>
                <p className="text-xs text-gray-400">Opcional — captura a posição atual</p>
              </div>
            </div>

            {/* Coordinates display */}
            {position ? (
              <div className="bg-green-50 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Latitude</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {position.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Longitude</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {position.longitude.toFixed(6)}
                  </span>
                </div>
                {position.accuracy && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Precisão</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ±{position.accuracy.toFixed(0)}m
                    </span>
                  </div>
                )}
                <a
                  href={`https://maps.google.com/?q=${position.latitude},${position.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline text-center mt-1"
                >
                  Ver no Google Maps
                </a>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-sm text-amber-800 font-medium">
                  {gpsError ?? "Nenhuma localização capturada neste dispositivo."}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Você pode continuar sem GPS e adicionar as coordenadas depois em Editar ponto de coleta.
                </p>
              </div>
            )}

            <Button
              variant={position ? "secondary" : "ghost"}
              size="md"
              className="w-full"
              icon={<Navigation size={18} />}
              loading={isCapturing}
              onClick={handleCapture}
            >
              {isCapturing
                ? "Capturando..."
                : position
                ? "Recapturar Localização"
                : "Capturar Localização"}
            </Button>
          </div>
        </Card>
      </PageContent>
    </Page>
  );
}
