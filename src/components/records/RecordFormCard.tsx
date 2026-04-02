import { Card } from "@/components/ui";
import {
  SpeciesField,
  IdentificationSelect,
  EnvironmentField,
  StratumField,
  ActivityField,
  QuantityInput,
  DistanceInput,
  SideSelect,
  ObservationsField,
} from "@/components/records/RecordFormFields";
import { type FaunaGroup, IDENTIFICATION_OPTIONS, ENVIRONMENT_OPTIONS, STRATUM_OPTIONS, ACTIVITY_OPTIONS, SIDE_OPTIONS } from "@/lib/types";
import { type RecordFormState } from "@/lib/recordForm";

export interface RecordFormCardProps {
  form: RecordFormState;
  errors: Partial<Record<keyof RecordFormState, string>>;
  group: FaunaGroup;
  onFieldChange: (field: keyof RecordFormState, value: any) => void;
  collectionPointId?: string;
  enableSpeciesDuplicateCheck?: boolean;
  excludeRecordId?: string;
}

export function RecordFormCard({
  form,
  errors,
  group,
  onFieldChange,
  collectionPointId,
  enableSpeciesDuplicateCheck,
  excludeRecordId,
}: RecordFormCardProps) {
  return (
    <Card padding="md">
      <div className="flex flex-col gap-5">
        <SpeciesField
          group={group}
          value={form.species}
          onChange={(value) => onFieldChange("species", value)}
          error={errors.species}
          collectionPointId={collectionPointId}
          enableDuplicateCheck={enableSpeciesDuplicateCheck}
          excludeRecordId={excludeRecordId}
        />
        <IdentificationSelect
          value={form.identification}
          onChange={(v) => onFieldChange("identification", v)}
          options={IDENTIFICATION_OPTIONS}
          error={errors.identification}
        />
        <EnvironmentField
          value={form.environment}
          onChange={(v) => onFieldChange("environment", v)}
          options={ENVIRONMENT_OPTIONS}
          error={errors.environment}
        />
        <StratumField
          value={form.stratum}
          onChange={(v) => onFieldChange("stratum", v as any)}
          options={STRATUM_OPTIONS}
          error={errors.stratum}
        />
        <ActivityField
          value={form.activity}
          onChange={(v) => onFieldChange("activity", v as any)}
          options={ACTIVITY_OPTIONS}
          error={errors.activity}
        />
        <div className="grid grid-cols-2 gap-3">
          <QuantityInput
            value={form.quantity}
            onChange={(v) => onFieldChange("quantity", v)}
            error={errors.quantity}
          />
          <DistanceInput
            value={form.distance}
            onChange={(v) => onFieldChange("distance", v)}
            error={errors.distance}
          />
        </div>
        <SideSelect
          value={form.side}
          onChange={(v) => onFieldChange("side", v)}
          options={SIDE_OPTIONS}
          error={errors.side}
        />
        <ObservationsField
          value={form.observations}
          onChange={(v) => onFieldChange("observations", v)}
        />
      </div>
    </Card>
  );
}
