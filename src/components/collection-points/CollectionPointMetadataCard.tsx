import { Card, Badge } from "@/components/ui";
import { MetadataField } from "@/components/shared/MetadataField";
import { GROUP_LABELS, METHODOLOGY_LABELS, type CollectionPoint } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { isMackinnonMethodology } from "@/lib/mackinnon";

type Props = {
  point: CollectionPoint;
  recordCount: number;
};

export function CollectionPointMetadataCard({ point, recordCount }: Props) {
  return (
    <>
      <Card padding="md">
        <div className="flex items-center justify-between gap-2">
          <MetadataField
            label="Criado em"
            value={formatDateTime(point.createdAt)}
            valueClassName="font-semibold text-gray-900"
          />
          <Badge variant="group" group={point.group}>
            {GROUP_LABELS[point.group]}
          </Badge>
        </div>
      </Card>

      <Card padding="md">
        <div className="flex flex-col gap-2">
          <MetadataField
            label="Nome"
            value={point.name}
            valueClassName="font-semibold text-gray-900"
          />
          <MetadataField
            label="Metodologia"
            value={METHODOLOGY_LABELS[point.methodology] ?? point.methodology}
          />
          {isMackinnonMethodology(point.methodology) && (
            <MetadataField
              label="Limite Mackinnon"
              value={point.limit !== undefined ? `${recordCount}/${point.limit} registros` : "Não definido"}
            />
          )}
          {point.notes && (
            <MetadataField
              label="Observações"
              value={point.notes}
              valueClassName="whitespace-pre-line"
            />
          )}
        </div>
      </Card>
    </>
  );
}
