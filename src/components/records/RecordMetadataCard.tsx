import { Card, Badge } from "@/components/ui";
import { MetadataField } from "@/components/shared/MetadataField";
import { formatDateTime } from "@/lib/format";
import { type FaunaRecord } from "@/lib/types";

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
        <MetadataField
          label="Identificação"
          value={<Badge variant="primary">{record.data.identification}</Badge>}
          layout="inline"
        />
      </div>
    </Card>
  );
}