import { Card } from "@/components/ui";
import { ViewField } from "@/components/records/RecordFormFields";
import { type ObservationData, type FaunaGroup } from "@/lib/types";
import { theme } from "@/lib/theme";

export interface RecordViewCardProps {
  record: {
    data: ObservationData;
    group: FaunaGroup;
  };
}

export function RecordViewCard({ record }: RecordViewCardProps) {
  const { color } = theme.groups[record.group] ?? theme.groups.birds;

  return (
    <Card padding="md">
      <div className="flex flex-col gap-4">
        {/* Species */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            Espécie
          </p>
          <p className="text-xl font-bold text-gray-900">
            {record.data.species}
          </p>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-2 gap-3">
          <ViewField label="Ambiente" value={record.data.environment} />
          <ViewField label="Estrato" value={record.data.stratum} />
          <ViewField label="Atividade" value={record.data.activity} />
          <ViewField label="Lado" value={record.data.side} />
          <ViewField label="Quantidade" value={String(record.data.quantity)} />
          <ViewField label="Distância" value={`${record.data.distance} m`} />
        </div>

        {/* Observations */}
        {record.data.observations && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
              Observações
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {record.data.observations}
            </p>
          </div>
        )}
      </div>

      {/* Group accent */}
      <div
        className="h-1 w-full rounded-b-2xl mt-4 opacity-40"
        style={{ backgroundColor: color }}
      />
    </Card>
  );
}
