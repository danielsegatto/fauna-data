import { Card, Badge } from "@/components/ui";
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
                {point.limit !== undefined ? `${recordCount}/${point.limit} registros` : "Não definido"}
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
    </>
  );
}
