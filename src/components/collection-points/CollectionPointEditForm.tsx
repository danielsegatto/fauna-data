import { useMemo } from "react";
import { Card, Input, Textarea, Select } from "@/components/ui";
import { MackinnonLimitField } from "@/components/collection-points/MackinnonLimitField";
import {
  GROUP_LABELS,
  METHODOLOGIES,
  METHODOLOGY_LABELS,
  type FaunaGroup,
  type SelectOption,
} from "@/lib/types";
import { isMackinnonMethodology } from "@/lib/mackinnon";

const GROUP_OPTIONS: SelectOption[] = [
  { label: GROUP_LABELS.birds, value: "birds" },
  { label: GROUP_LABELS.mammals, value: "mammals" },
  { label: GROUP_LABELS.herpetofauna, value: "herpetofauna" },
];

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

type Props = {
  form: FormState;
  errors: { name: string; methodology: string; limit: string };
  onChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
};

export function CollectionPointEditForm({ form, errors, onChange }: Props) {
  const methodologyOptions = useMemo(() => {
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
  }, [form.group, form.methodology]);

  return (
    <Card padding="md">
      <div className="flex flex-col gap-5">
        <Input
          label="Nome do Ponto *"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          error={errors.name}
        />

        <Textarea
          label="Observações"
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
        />

        <Select
          label="Grupo"
          options={GROUP_OPTIONS}
          value={form.group}
          onChange={(value) => {
            const newGroup = value as FaunaGroup;
            const nextMethodology = METHODOLOGIES[newGroup]?.[0]?.id ?? "";
            onChange("group", newGroup);
            if (!METHODOLOGIES[newGroup]?.some((m) => m.id === form.methodology)) {
              onChange("methodology", nextMethodology);
            }
          }}
        />

        <Select
          label="Metodologia *"
          options={methodologyOptions}
          value={form.methodology}
          onChange={(value) => onChange("methodology", value)}
          error={errors.methodology}
        />

        {isMackinnonMethodology(form.methodology) && (
          <MackinnonLimitField
            value={form.limit}
            onChange={(v) => onChange("limit", v)}
            error={errors.limit}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            value={form.latitude}
            onChange={(e) => onChange("latitude", e.target.value)}
            inputMode="decimal"
            placeholder="Ex: -10.123456"
          />
          <Input
            label="Longitude"
            value={form.longitude}
            onChange={(e) => onChange("longitude", e.target.value)}
            inputMode="decimal"
            placeholder="Ex: -48.654321"
          />
        </div>

        <Input
          label="Precisão (m)"
          value={form.accuracy}
          onChange={(e) => onChange("accuracy", e.target.value)}
          inputMode="decimal"
          placeholder="Ex: 8"
        />
      </div>
    </Card>
  );
}
