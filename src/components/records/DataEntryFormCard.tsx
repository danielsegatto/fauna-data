import { Card } from "@/components/ui";
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
import {
  ENVIRONMENT_OPTIONS,
  STRATUM_OPTIONS,
  ACTIVITY_OPTIONS,
  type FaunaGroup,
} from "@/lib/types";
import {
  type RecordFormErrors,
  type RecordFormState,
} from "@/lib/recordForm";

const DISTANCE_PRESETS = [1, 5, 10, 20, 50];
const ENVIRONMENT_OPTIONS_WITHOUT_OTHER = ENVIRONMENT_OPTIONS.filter((option) => option.value !== "outro");

export interface DataEntryFormCardProps {
  form: RecordFormState;
  errors: RecordFormErrors;
  group: FaunaGroup;
  onFieldChange: <K extends keyof RecordFormState>(field: K, value: RecordFormState[K]) => void;
}

export function DataEntryFormCard({
  form,
  errors,
  group,
  onFieldChange,
}: DataEntryFormCardProps) {
  const isAudioSelected = form.identification === "A" || form.identification === "AV";
  const isVisualSelected = form.identification === "V" || form.identification === "AV";

  const toggleIdentification = (channel: "A" | "V") => {
    const nextAudio = channel === "A" ? !isAudioSelected : isAudioSelected;
    const nextVisual = channel === "V" ? !isVisualSelected : isVisualSelected;

    let nextValue = "";
    if (nextAudio && nextVisual) nextValue = "AV";
    else if (nextAudio) nextValue = "A";
    else if (nextVisual) nextValue = "V";

    onFieldChange("identification", nextValue);
  };

  const adjustQuantity = (delta: number) => {
    const current = Number(form.quantity);
    const safeCurrent = Number.isFinite(current) && current > 0 ? current : 0;
    const nextValue = Math.max(1, safeCurrent + delta);
    onFieldChange("quantity", String(nextValue));
  };

  const adjustDistance = (delta: number) => {
    const current = Number(form.distance);
    const safeCurrent = Number.isFinite(current) && current >= 0 ? current : 0;
    const next = Math.max(0, safeCurrent + delta);
    onFieldChange("distance", String(next));
  };

  return (
    <Card padding="md">
      <div className="flex flex-col gap-5">
        <SpeciesField
          group={group}
          value={form.species}
          onChange={(value) => onFieldChange("species", value)}
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
          onChange={(value) => onFieldChange("environment", value)}
          options={ENVIRONMENT_OPTIONS_WITHOUT_OTHER}
          error={errors.environment}
        />

        <StratumField
          value={form.stratum}
          onChange={(value) => onFieldChange("stratum", value)}
          options={STRATUM_OPTIONS}
          error={errors.stratum}
        />

        <ActivityField
          value={form.activity}
          onChange={(value) => onFieldChange("activity", value)}
          options={ACTIVITY_OPTIONS}
          error={errors.activity}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuantityStepper
            value={form.quantity}
            onChange={(value) => onFieldChange("quantity", value)}
            onDecrease={() => adjustQuantity(-1)}
            onIncrease={() => adjustQuantity(1)}
            error={errors.quantity}
          />

          <DistanceStepper
            value={form.distance}
            onChange={(value) => onFieldChange("distance", value)}
            onDecrease={() => adjustDistance(-1)}
            onIncrease={() => adjustDistance(1)}
            onClear={() => onFieldChange("distance", "")}
            presets={DISTANCE_PRESETS}
            error={errors.distance}
          />
        </div>

        <SideGrid
          value={form.side}
          onChange={(value) => onFieldChange("side", value)}
          onClear={() => onFieldChange("side", "")}
          error={errors.side}
        />

        <ObservationsField
          value={form.observations}
          onChange={(value) => onFieldChange("observations", value)}
        />
      </div>
    </Card>
  );
}
