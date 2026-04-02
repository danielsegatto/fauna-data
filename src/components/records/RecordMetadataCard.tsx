import { Card, Badge } from "@/components/ui";
import { MetadataField } from "@/components/shared/MetadataField";
import { formatDateTime } from "@/lib/format";
import { type FaunaRecord } from "@/lib/types";
import { MapPin } from "lucide-react";

interface RecordMetadataCardProps {
  record: FaunaRecord;
  collectionPointName?: string;
}

export function RecordMetadataCard({
  record,
  collectionPointName,
}: RecordMetadataCardProps) {
  return (
    <Card padding="md">
      <div className="flex flex-col gap-2">
        <MetadataField
          label="Data e hora"
          value={formatDateTime(record.timestamp)}
          layout="inline"
          valueClassName="text-xs font-semibold text-gray-700"
        />
        {collectionPointName && (
          <MetadataField
            label="Ponto de Coleta"
            value={collectionPointName}
            layout="inline"
            valueClassName="text-xs font-semibold text-gray-700 truncate max-w-[60%] text-right"
          />
        )}
        {Number.isFinite(record.latitude) && Number.isFinite(record.longitude) && (
          <MetadataField
            label="Coordenadas"
            value={
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-green-600" />
                <span>{record.latitude!.toFixed(6)}, {record.longitude!.toFixed(6)}</span>
              </span>
            }
            layout="inline"
            valueClassName="text-xs font-mono text-gray-700"
          />
        )}
        <MetadataField
          label="Identificação"
          value={<Badge variant="primary">{record.data.identification}</Badge>}
          layout="inline"
        />
      </div>
    </Card>
  );
}